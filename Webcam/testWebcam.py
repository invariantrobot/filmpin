import cv2


cam = cv2.VideoCapture(0)

cv2.namedWindow("test")

overlay_img = cv2.resize(cv2.imread("Pen.png"), (315, 89))


overlay_w, overlay_h, colour = overlay_img.shape
x, y = 20, 20

img_counter = 0

ret, frame = cam.read()
    
H, W = frame.shape[:2]

#Fix image size
pos_w_0 = round((H - overlay_w)/2)
pos_w_1 = round((H + overlay_w)/2)
pos_h_0 = round((W - overlay_h)/2)
pos_h_1 = round((W + overlay_h)/2)

pos_w_1 -= (pos_w_1 - pos_w_0) - overlay_w
pos_h_1 -= (pos_h_1 - pos_h_0) - overlay_h


while True:
    ret, frame = cam.read()
    
    H, W = frame.shape[:2]
    
    if not ret:
        print("failed to grab frame")
        break
    
    frame[pos_w_0:pos_w_1, pos_h_0:pos_h_1] = overlay_img
    
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