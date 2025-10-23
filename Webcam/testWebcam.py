import cv2


cam = cv2.VideoCapture(1)

cv2.namedWindow("test")

overlay_img = cv2.imread("Pen.png")

overlay_w, overlay_h = 320, 180
x, y = 20, 20

img_counter = 0

while True:
    ret, frame = cam.read()
    
    H, W = frame.shape[:2]
    
    if not ret:
        print("failed to grab frame")
        break
    
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