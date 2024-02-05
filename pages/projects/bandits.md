---
layout: default
title: Multi-Armed Bandits
description: because the i.i.d. setting is too easy and general reinforcement learning is too hard
permalink: /projects/bandits/
---

## Pure Exploration Problems in Multi-Armed Bandits

- My MSc [thesis](https://era.library.ualberta.ca/items/e4d666bc-5825-401d-8cdd-e7dcae90f1fd)

- My thesis presentation [slides](https://docs.google.com/presentation/d/1oH7xgx8LvFTtbOWEDjjZt4ycRAobA9ztOEjYfNreTqk/edit?usp=sharing) -- contains transitions, be sure to view in presentation mode

- ICML 2023 [paper](https://proceedings.mlr.press/v202/zhao23g) (second author)


### Motivation

Imagine that your friend has just started a small online clothing store which sells elaborately embroidered sweaters. Setting up production for a new sweater design is a time and labour intensive process, involving designing the new embroidery pattern, setting up the sewing equipment to stitch the pattern, and obtaining the material required for the design. Due to the small-scale nature of their business and the limited amount of sweaters that they can produce each day they plan to maximize their return on initial production set-up time and cost by making a large batch of one design at a time.

Your friend has a several sweater designs that they are considering for production and wants to determine which sweater will be the most popular and sell the most sweaters. In order to make this selection they pay to have a questionnaire-style advertisement hosted on websites: the ad shows users one of the sweater designs, and asks them to rate their interest in buying the sweater from on a scale from 1-3. They are charged a small fee by the ad-hosting service each time a mini-questionnaire is completed and in order to keep costs within their budget has payed the ad service for 500 responses, after which they'll commit to sweater based on the results of the questionnaires. To paraphrase the situation: your friend wants to use a fixed number of noisy samples to make a sweater selection that maximizes some statistic of the number of sweaters sold. For example, they could look to maximize the expected number of sweaters sold, or the probability that they end up selecting the most popular sweater.

If your friend was in charge of the way that users are assigned the sweater that they'll see on their questionnaire they may choose a traditional A/B/n testing approach which would be to show each user a sweater selected uniformly at random. A disadvantage of this approach is that if some of the sweaters designs are truly far more popular than others then this may be the most efficient use of their sampling budget; a more powerful approach would be for them to take a sequential decision making approach to collecting information, for instance ruling out designs that users have already indicated are clearly unpopular and in doing so reserving more samples to rank the popularities of the remaining designs.

This example has several characteristics which are archetypical of pure exploration problems in multi-armed:

- A selection among a finite collection of options has to be made based on stochastic feedback about the quality of each individual option.
- In the absence of additional problem structure we only receive feedback about the option that we chose (e.g. unless we have a way to relate sweaters 1 and 2, asking users about sweater tells us nothing about the quality of sweater 2)
- The quality of each option is assumed to be fixed during the sampling process (e.g. we assume that fashion trends will not change during the time-span of our user survey), and each sample of this quality is assumed to be independent and identically distributed (i.i.d.).
- Samples can be collected in a fully adaptive fashion; the decision of which sweater to observe a user sample from next can be decided based on all previous observations, and in relevant scenarios the decision to stop sampling can also be made in a data-dependent manner.
- Apart from sampling budget constraints and considerations of sample efficiency there is no `cost' for taking a sample.

---

Pure exploration research is focused on developing and analysing algorithms which select which data to collect along with which option to recommend in order to return the best selection possible. There are many problem settings within this field (such as minimizing the samples required for a learner to be able guarantee a decision of a prescribed quality, or optimizing the quality of a decision given a fixed budget) as well as many measures of the quality of the selection returned. Alas all problem settings and objectives are not made equal in the eyes of a statistician running an experiment in a given real world situation. My [thesis](https://era.library.ualberta.ca/items/e4d666bc-5825-401d-8cdd-e7dcae90f1fd) collates state of the art results in many of the pure exploration settings, discussing their strengths and limitations and also provides some new characterizations of the hardness of several pure exploration problems.
