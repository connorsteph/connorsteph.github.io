---
layout: default
title: Visual Servoing with Humans in the Loop
description: seven degrees of freedom, a joystick and a dream
permalink: /projects/visual_servoing/
---

## Task-Focused Robotic Teleoperation Using Computer Vision<a name="UVSTO"></a>

[Paper](https://github.com/connorsteph/connorsteph/files/9551660/uvs_teleoperation.pdf) (unpublished)

[Link](https://github.com/connorsteph/hil_visual_servoing_on_barrett_wam) to teleop simulator code used to run demos / create paper figures -- in an unrunnable state due to several undocumented dependencies, an artifact of absolutely classic research code hell. I was young.

In the summer of 2018 I led the development of a new method for joystick operation of a robotic arm for reaching and grasping tasks. A general purpose robotic arm typically has around seven degrees of freedom (DOF), corresponding to the possible configuration for all of the joints, e.g. the elbow wrist and shoulder joints. In many applications of robotic arms to assistive living users command motion of the arm using a joystick control. Mapping joystick controls to full specification of the arm's position requires switching between control modes e.g. controlling either the position of the end effector or its orientation. Reaching and grasping objects with a robotic arm can be a slow and mentally taxing task for end users who require assistance carrying out their daily tasks. Some proposed solutions include combining computer vision with automated controllers that enable users to specify an object they wish to grasp. A disadvantage of these systems (other than their complexity) is that many users of assistive robotic value the a user-in-the-loop system in which they retain at least partial control of the arm.

Our proposed solution consisted of a scheme in which a user highlights the object that they wish to grasp on a computer screen, and then use a joystick controller to execute the task. Having the users target marked on a computer allows us to design a joystick control scheme which is defined with respect to their goal. The idea behind our control scheme was to separate reaching and grasping into two separate modes. In the reaching mode the user can choose to move directly toward or away from the object with one button (guided by a computer vision control scheme) or to provide perturbations in a direction perpendicular to the direction of the object. Figure 5 shows a direct and a perturbed trajectory for comparison.

<th align="left"> Figure 5: (Left) A direct reaching trajectory guided by first-derivative estimates of the direction to the target. (Right) A reaching path with user perturbations causing the arm to approach from above the direct path to the object.</th>
<th align="left"> Figure 6: (Left) Rotation about the x-axis around the object while in grasping mode. (Right) Rotation about the y-axis while in grasping mode.</th>
<Image src="https://user-images.githubusercontent.com/24722905/189761478-4b665875-453e-4708-88ed-b9105608fcd0.png" width="100%" />
<Image src="https://user-images.githubusercontent.com/24722905/189764007-34958c7f-4af5-4cb1-95b9-eb00fce459ab.png" width="100%">

<br><br><br>
In the grasping mode we imagine that there is a ball which surrounds the object we wish to grasp, and we design our control scheme so that the robot end-effector is always on the surface of the ball, palm pointed to the object. The user can shrink the ball, or move the arm to a different position on the ball. The video below illustrates the idea. Imagine that there is a ball with the object at its center.

<br><br>

<!-- centered -->

<video src="https://user-images.githubusercontent.com/24722905/189757526-a76145e9-eb21-444f-abe9-8716ed33714f.mp4" width="100%" controls></video>
