import cv2


cam = cv2.VideoCapture(0)

cv2.namedWindow("test")

orb = cv2.ORB_create()

plus = 0


while True:
    ret, frame = cam.read()
    frame = cv2.add(frame, plus)
 

    
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
    elif k%256 == ord('p'):
        plus += 1


cam.release()

cv2.destroyAllWindows()