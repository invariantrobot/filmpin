import cv2


cam = cv2.VideoCapture(0)

cv2.namedWindow("test")

orb = cv2.ORB_create()

BORDER_SIZE = 10
OFF_WHITE = (227, 238, 246)
OPACITY = 0.8

overlay_img = cv2.resize(cv2.imread("pentest.png"), (315, 89))

overlay_w, overlay_h, colour = overlay_img.shape

# Add border
overlay_img[0:BORDER_SIZE,0:] = OFF_WHITE
overlay_img[overlay_w-BORDER_SIZE:overlay_w,0:] = OFF_WHITE
overlay_img[0:,0:BORDER_SIZE] = OFF_WHITE
overlay_img[0:,overlay_h-BORDER_SIZE:overlay_h] = OFF_WHITE

overlay_w, overlay_h, colour = overlay_img.shape

img_counter = 0

ret, frame = cam.read()
    
H, W = frame.shape[:2]



#Fix image size
pos_w_0 = round((H - overlay_w)/2)
pos_w_1 = round((H + overlay_w)/2)
pos_h_0 = round((W - overlay_h)/2)
pos_h_1 = round((W + overlay_h)/2)

# Fix rounding error to get correct size of picture
pos_w_1 -= (pos_w_1 - pos_w_0) - overlay_w
pos_h_1 -= (pos_h_1 - pos_h_0) - overlay_h

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


while True:
    ret, frame = cam.read()

    overlay = frame.copy()
    kp1, des1 = orb.detectAndCompute(frame, None)
    kp2, des2 = orb.detectAndCompute(overlay_img, None)

    frame = cv2.drawKeypoints(frame, kp1, None, color=(0, 255, 0))
    overlay_img_2 = cv2.drawKeypoints(overlay_img, kp2, None, color=(0, 255, 0))

    matches = bf.match(des1, des2)

    matches = sorted(matches, key=lambda x: x.distance)
    
    H, W = frame.shape[:2]
    
    if not ret:
        print("failed to grab frame")
        break
    
    # Take out image part and blend with image
    smallerFrame = overlay[pos_w_0:pos_w_1, pos_h_0:pos_h_1]


    blendedFrame = cv2.addWeighted(smallerFrame, 1 - OPACITY, overlay_img_2, OPACITY, 0)

    frame[pos_w_0:pos_w_1, pos_h_0:pos_h_1] = blendedFrame
    
    cv2.imshow("test", frame)

    k = cv2.waitKey(1)
    if k%256 == 27:
        # ESC pressed
        print("Escape hit, closing...")
        break
    elif k%256 == 32:
        # SPACE pressed
        img_name = "opencv_frame_{}.png".format(img_counter)
        cv2.imwrite(img_name, frame)
        print("{} written!".format(img_name))
        img_counter += 1

cam.release()

cv2.destroyAllWindows()