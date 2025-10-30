import cv2
import math
import numpy as np

#initialize variables 

# Variables for printing and control
SAVE_ONCE = False
PRINT_VAR = 0
image_detection = False
pictureTime = False
tracking_object = False
# Variables for the look of the picture
BORDER_SIZE = 10
OFF_WHITE = (227, 238, 246)
OPACITY = 0.7
RELATIVE_SIZE = 0.3
# Variables for detecting features
HOTSPOT_THRESHOLD = 4
BEST_AMOUNT = 5
PICTURE_RATIO = 0.5
THRESHHOLD_PICTURE = 5
# 
TRACKING_RATIO_THRESHOLD = 0.1
GRANULARITY_TRACKING = 0.05
METHOD_LIST = [cv2.TM_CCOEFF_NORMED, cv2.TM_CCORR_NORMED, cv2.TM_SQDIFF_NORMED]
METHOD_LIST_STR = ["TM_CCOEFF_NORMED", "TM_CCORR_NORMED", "TM_SQDIFF_NORMED"]
CURRENT_METHOD = 0
SPOTS_THRESHOLD = 4


img_counter = 0

def isHotSpot(matches, frame, photoPlace):
    # Returns True if the current location for the screenshot is a hotspot of matches
    global SAVE_ONCE
    global PRINT_VAR
    spotAmount = 0
    
    iter = 0
    likeness = 0

    for match in matches:
        p1 = frame[0][match.queryIdx].pt
        p2 = frame[1][match.trainIdx].pt

        pointX, pointY = round(p1[0]), round(p1[1])
        trueX, trueY = round(p2[0]) + photoPlace[1][0], round(p2[1] + photoPlace[0][0])
        if (photoPlace[1][1] > pointX > photoPlace[1][0]) and (photoPlace[0][1] > pointY > photoPlace[0][0]):
            spotAmount += 1
            likeness += math.sqrt((pointX - trueX)**2 + (pointY-trueY)**2)

        if iter > BEST_AMOUNT:
            break
        iter += 1
    
    
    if likeness == 0 and spotAmount == 0:
        return False
    elif likeness == 0:
        likeness = 0.001
    
    likeness = likeness/spotAmount
    
    if PRINT_VAR%20 == 0:
        print(likeness)
    
    if spotAmount > BEST_AMOUNT*PICTURE_RATIO and likeness < THRESHHOLD_PICTURE:
        return True

    return False

# Read in methods and objects

cam = cv2.VideoCapture(0)
cv2.namedWindow("test")
orgPic = cv2.imread("booktest.png") # Read in picture

orb = cv2.ORB_create()

ret, frame = cam.read()
cam_H, cam_W = frame.shape[:2]

# Scale and format the picture that is going to overlay
shape_org = orgPic.shape[:2]
scaleFactor = RELATIVE_SIZE*cam_H/shape_org[0]
overlay_img = cv2.resize(orgPic, (round(shape_org[1]*scaleFactor), round(shape_org[0]*scaleFactor)))
orgPicGray = cv2.cvtColor(orgPic, cv2.COLOR_BGR2GRAY)
overlay_w, overlay_h, colour = overlay_img.shape

# Add border
overlay_img[0:BORDER_SIZE,0:] = OFF_WHITE
overlay_img[overlay_w-BORDER_SIZE:overlay_w,0:] = OFF_WHITE
overlay_img[0:,0:BORDER_SIZE] = OFF_WHITE
overlay_img[0:,overlay_h-BORDER_SIZE:overlay_h] = OFF_WHITE

ret, frame = cam.read()
W, H = frame.shape[:2]

#Fix image size
pos_w_0 = round((W - overlay_w)/2)
pos_w_1 = round((W + overlay_w)/2)
pos_h_0 = round((H - overlay_h)/2)
pos_h_1 = round((H + overlay_h)/2)

# Fix rounding error to get correct size of picture
pos_w_1 -= (pos_w_1 - pos_w_0) - overlay_w
pos_h_1 -= (pos_h_1 - pos_h_0) - overlay_h

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


while True:
    PRINT_VAR+=1
    ret, frame = cam.read()
    overlay = frame.copy()
    H, W = frame.shape[:2]
    
    if not ret:
        print("failed to grab frame")
        break
    
    # Calucate features and map them
    kp1, des1 = orb.detectAndCompute(frame, None)
    kp2, des2 = orb.detectAndCompute(overlay_img, None)
    matches = bf.match(des1, des2)
    matches = sorted(matches, key=lambda x: x.distance)
    

    # Take out image part and blend with image
    smallerFrame = overlay[pos_w_0:pos_w_1, pos_h_0:pos_h_1]
    blendedFrame = cv2.addWeighted(smallerFrame, 1 - OPACITY, overlay_img, OPACITY, 0)
    frame[pos_w_0:pos_w_1, pos_h_0:pos_h_1] = blendedFrame
    picture_frame = frame.copy()
    
    spots = []

    if image_detection or tracking_object:
        iter = 0
        for match in matches:
            p1 = kp1[match.queryIdx].pt
            p2 = kp2[match.trainIdx].pt
            point2 = (round(p2[0] + pos_h_0), round(p2[1] + pos_w_0))
            point1 = (round(p1[0]), round(p1[1]))
            cv2.circle(frame, center = point1, radius = 10, color =(0,255,0), thickness=2)
            cv2.circle(frame, center = point2, radius = 5, color= (255,255,0), thickness=2)
            iter += 1
            spots.append(point1)
            if iter > BEST_AMOUNT:
                break
    
    # Take a photo if the picture is in a hotspot
    if image_detection:
        #Draw 10 most matching features
        if isHotSpot(matches, (kp1, kp2), ((pos_w_0, pos_w_1),(pos_h_0, pos_h_1))):
            img_name = f"detected_match_{img_counter}.png".format(img_counter)
            if pictureTime or SAVE_ONCE:
                cv2.imwrite(img_name, picture_frame)
                SAVE_ONCE = False
                img_counter += 1
    
    if tracking_object:
        frameGray = cv2.cvtColor(overlay, cv2.COLOR_BGR2GRAY)
        grayObject = orgPicGray.copy()
        w_template, h_template = grayObject.shape[::-1]

        if w_template > h_template:
            start_width = H
        else:
            start_width = w_template/h_template*H

        factor = 1
        
        end_width = H*0.1
        current_width = start_width*0.7
        highest = -1
        besty, bestx = None, None
        bestw, besth = None, None
        foundGood = False
        

        while current_width > end_width: #Reduce frame until small enough
            
            current_h = current_width/w_template*h_template
            grayObject = cv2.resize(grayObject, (int(current_width), int(current_h)))
            res = cv2.matchTemplate(frameGray, grayObject, METHOD_LIST[CURRENT_METHOD])
            k = 30
            flat = res.ravel()
            idx = np.argpartition(flat, -k)[-k:]
            ys, xs = np.unravel_index(idx, res.shape)
            
            for y, x in zip(ys, xs):
                # Logic to check if spots are in the area
                w_0 = y
                w_1 = y + round(current_h)
                h_0 = x
                h_1 = x + round(current_width)

                spotsInArea = 0

                for spot in spots:
                    if w_1 > spot[1] > w_0 and h_1 > spot[0] > h_0:
                        spotsInArea += 1

                if res[y][x] > highest and spotsInArea > SPOTS_THRESHOLD:
                    highest = res[y][x]
                    besty, bestx = y, x
                    bestw, besth = current_width, current_h
                    foundGood = True


            factor -= GRANULARITY_TRACKING
            current_width = factor*start_width
        if not highest == -1:
            cv2.rectangle(frame, (bestx,besty), (bestx+int(bestw),besty+int(besth)), color =(0,255,0), thickness=2)
        #for pt in zip(*loc[::-1]):
        #    cv2.rectangle(frame, pt, (pt[0] + w, pt[1] + h), (0, 255, 255), 2)


    # Interaction by keyboard
    
    cv2.imshow("test", frame) # Show the image

    k = cv2.waitKey(1)
    if k%256 == 27:
        # ESC pressed
        print("Escape hit, closing...")
        break
    elif k%256 == 32: # Turn on feature tracking
        image_detection = not image_detection
        if image_detection:
            print("image detection engaged")
        else:
            print("image detection disengaged")
    elif k%256 == ord('s'): # start taking pictures
        pictureTime = not pictureTime
        if pictureTime:
            print("Taking pictures now")
    elif k%256 == ord('t'): # turn on tracking feature
        tracking_object = not tracking_object
        if tracking_object:
            print("Now tracking object")
    elif k%256 == ord('p'):
        THRESHHOLD_PICTURE += 1
        print(f"Increasing threshhold for picture to {THRESHHOLD_PICTURE}")
    elif k%256 == ord('o'):
        THRESHHOLD_PICTURE -= 1
        print(f"Decreasing threshhold for picture to {THRESHHOLD_PICTURE}")
    elif k%256 == ord('k'):
        CURRENT_METHOD = (CURRENT_METHOD + 1)%(len(METHOD_LIST))
        print(f"Switching method to {METHOD_LIST_STR[CURRENT_METHOD]}")

cam.release()
cv2.destroyAllWindows()