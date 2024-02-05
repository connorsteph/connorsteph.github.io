---
layout: default
title: Quantum Chemistry
description: if it walks like the ground state and talks like the ground state, it's good enough 
permalink: /projects/q_chem/
---

## Using Quantum Chemistry to Estimate Properties of Exotic Molecules  <a name="PsH"></a>
  <a href="https://arxiv.org/abs/2208.07907"> Positronium hydride decay into proton, electron, and one or zero photons</a> (Phys. Rev. Letters A, 2023)
  
In the summer of 2016 I worked with another student under the supervision of Prof. Andrzej Czarnecki to calculate the properties of <a href="https://en.wikipedia.org/wiki/Positronium_hydride"> Positronium Hydride </a> (PsH), an exotic molecule comprising of the bound state of a proton and positron with two electrons, which is believed to have been observed in experiments in the 1990s [[1](#1), [2](#2)]. Due to its low (theorized) binding energy this molecule has been challenging to study experimentally. In order to estimate the properties of this molecule we made use of numerical optimization along with the <a href="https://en.wikipedia.org/wiki/Variational_method_(quantum_mechanics)"> variational method </a> the approximate the ground state wave function for PsH. In lay man's terms (or at least a lay man with an undergraduate course in quantum mechanics under their belt) the variational method operates on the principle that the true ground state wavefunction of a system is the unique wavefunction which minimizes the energy functional of the system. In other words if you plug in the wrong wave function and calculate the ground state energy of the system you will get a number which is larger than the true ground state energy. In order to better approximate the true ground state wave function we can parameterize our trial wave functional and use of numerical optimization to optimize the trial parameters to find a wave function which minimizes the energy functional. The resulting approximate ground-state wavefunction was used to approximate the distances between the constituent particles in PsH and estimate rates of decays of molecule due to the annihilation of the positron with one of the constituent electrons. 

The description above may seem to make these kinds of problems seem trivial. One of the first problems which emerges is that in order to be able to calculate properties of a given trial wave function such as its energy, which is required for the variational method, along with other properties of interest such as the average distance between the positron from the proton and its electron in PsH we need to evaluate potentially complex integrals. In this work we made use of a an explicitly correlated Guassian wave-function basis which allowed us to analytically evaluate integrals, reducing the problem to one of optimizing the resulting function of trial wavefunction parameters. A potential disadvantage to this approach is that we cannot guarantee (and in fact it is almost certainly not true) that the true ground state wavefunction lies in the space of functions which our parametrization can represent. This presents us with a tradeoff. If we introduce more basis function or parameters into our wavefunction then we can potentially reach lower energies (and better approximations to the true ground state wavefunction) at the cost of a more expensive and challenging optimization problem. If we choose a more flexible function approximation scheme we may be able to even further improve our best-case approximation, but we may not be able to analytically calculate expectations of the wave function, in addition to possible challenges in the optimization problem. Tackling these problems is a focus for modern quantum chemistry and a promising application of deep learning models, especially those which incorporate inductive biases that encode physical invariances of quantum mechanical systems while still enabling efficient training and inference. 

#### References  
[1] R. Pareja, R. M. de la Cruz, M. A. Pedrosa, R. Gonz ́alez, and Y. Chen, Positronium hydride in hydrogen-laden
thermochemically reduced MgO single crystals, Phys. Rev. B 41, 6220–6226 (1990).<a name="1"></a>
  
[2] D. M. Schrader, F. M. Jacobsen, N.-P. Frandsen, and U. Mikkelsen, Formation of positronium hydride, Phys.
Rev. Lett. 69, 57–60 (1992)<a name="2"></a>