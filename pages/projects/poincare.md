---
layout: default
title: Deep Learning for Dynamical Systems Analysis
description: wacky and wonderful ways to analyze trajectory data
permalink: /projects/poincare/
---

## Regressing Dynamic System Parameters from Poincare Maps

### Preprint [link](https://arxiv.org/pdf/2306.11258.pdf), link to paper [code](https://github.com/connorsteph/parameter_regression_from_return_maps_paper_code) ($5 CAD prize if you can help us figure out a better title).

### Informal abstract:

Poincare maps can be used to analyze dynamical systems. They have an interesting property in that different dynamical system parameters (say, the mass of a pendulum) result in human-perceptable, surprisingly smoothly changing characteristics in the Poincare map, even if the underlying trajectories integrated to obtain the maps are highly chaotic. This is notable since estimating the parameters of a dynamical system from trajectory data has proven challenging for chaotic systems. We show that a ResNet can exploit the smoothly changing visual characteristics of Poincare maps to regress a dynamical system's parameters, given a training dataset of Poincare maps for the same system with various parameters. We show that with basic data augmentation you can address some issues that emerge in applying this method in practice, such as the need to make predictions on data coming from trajectories integrated for different lengths of time, or with fewer sampled initial conditions.

---

<table style="width: 100%;">
  <tr>
    <th style="width: 50%;" align="left" valign="top"> Figure 1: Real-time construction of <a href="https://en.wikipedia.org/wiki/Poincar%C3%A9_map">Poincare maps</a> for the <a href="https://en.wikipedia.org/wiki/Swinging_Atwood%27s_machine">Swinging Atwood's Machine (SAM)</a> in a stable (red) and chaotic (green) configuration. On the left is the system configuration, on the right is the Poincare-Map representation of the system.</th>
    <th style="width: 50%;" align="left" valign="top"> Figure 2: Sampled Poincare maps for the Swinging Atwood's Machine (colours correspond to trajectories from different initial configurations) for various values of the system's mass-ratio parameter, μ.</th>
  </tr>
  <tr>
    <td style="width: 50%;" valign="top">
      <img src="https://user-images.githubusercontent.com/24722905/189714592-308d97c2-d428-454f-a52a-eb120572404a.gif" width="100%" />
    </td>
    <td style="width: 50%;" valign="top">
      <img src="https://user-images.githubusercontent.com/24722905/189714680-f54d6c14-bdc2-428c-a57b-da7816f28378.png" width="100%" />
    </td>
  </tr>
</table>

<br>

<table style="width: 100%;">
  <tr>
    <th style="width: 100%;" align="left" valign="top">Figure 3: An example input-output for a ResNet trained to estimate the mass ratio parameter of the SAM system which produced the Poincare map (left) input to the network. On the right is the parameter estimate, along with a higher quality (trajectories integrated from more initial conditions, for longer) Poincare map corresponding to the network's estimated parameter.</th>
  </tr>
  <tr>
    <td style="width: 100%;" align="center" valign="top">
      <img src="https://user-images.githubusercontent.com/24722905/189736428-af463574-c211-495a-80a5-b8302fbd1ac9.png" width="100%" />
    </td>
  </tr>
</table>

<br><br>

<!-- <table style="width: 100%;">
  <tr>
    <th style="width: 50%;" align="left" valign="top"> Figure 4: Pixel-wise classification of the chaoticity of trajectories using a U-Net style architecture with a standard semantic segmentation approach. Left: ground truth, right: predictions. Note the blob-like artifacts in the prediction (right) which imply multiple classifications for the same trajectory.</th>
    <th style="width: 50%;" align="left" valign="top"> Figure 5: Trajectory chaos classifications obtained from a physics-based modification of the U-Net architecture which makes classifications at the trajectory level.</th>
  </tr>
  <tr>
    <td style="width: 50%;" align="center" valign="top">
      <img src="https://user-images.githubusercontent.com/24722905/189750499-f61a6b5d-9df4-42bc-8817-4e57d4de1631.png" width="100%" />
    </td>
    <td style="width: 50%;" align="center" valign="top">
      <img src="https://user-images.githubusercontent.com/24722905/189750494-3c81dfb9-df0d-4c5e-9897-942c32cb349b.png" width="100%" />
    </td>
  </tr>
</table> -->
