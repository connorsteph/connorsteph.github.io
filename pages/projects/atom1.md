---
layout: default
title: ATOM-1
description: a new paradigm for structural foundation models
permalink: /projects/atom1/
---

## Training an RNA Foundation Model using Chemical Mapping Data

### [Link](https://www.biorxiv.org/content/10.1101/2023.12.13.571579v1) to ATOM-1 whitepaper

### Informal abstract:

Protein language models and MSAs are a core component of ML protein structure prediction performance, providing crucial hints to models like AlphaFold and ESM about inter-residue interactions. Unfortunately for those trying to predict structures in mammalian mRNA, RNA MSA's are generally considered to be poor sources of RNA structural information, for example they are often shallow due to statistical challenges of only having four bases, need to get around the complex information structure in intron / exon regions in eukaryotic mRNA, and the need to disambiguate conservation due to RNA structure versus downstream statistical signal from nucleotides participating in codons.

In comes chemical probing data, which is a readout from one or more of a family of biochemical assays that provide nucleotide-level annotations about RNA structure in solution, namely whether a given nucleotide was accessible to be reacted with a chemical probing reagent during an experiment. This data provides indirect information about the secondary and tertiary structures that an RNA adopts in solution, and can be collected en-masse across millions of RNA sequences (both synthetic and from the transciptome). This data provides an excellent basis for a foundation model of RNA structure, as we demonstrate by showing that the embeddings of a model which has learned to predict chemical probing data of an RNA from sequence can be easily probed using simple models to achieve great performance on various downstream tasks related to RNA structure.
