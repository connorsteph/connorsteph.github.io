---
layout: default
title: Ataxx Engine
description: playing Ataxx for me, because I'm not very good
permalink: /projects/ataxx/
---

## An Interactive Tree Search Demo for Ataxx

[Link](https://github.com/connorsteph/ataxx_tree_search) to github project.

An Ataxx engine built on the alpha-beta pruning algorithm for minimax search, written in C++ for a graduate course project in the Fall of 2019. Initially just a tree search engine with simple CLI controls to hook into the tournament framework, I've extended the project to include a web server to play Ataxx (against humans or the engine) with point and click controls. The game engine / server can be built in an entirely containerized fashion to make it easier to set up and try. Just clone the repository and run `./build.sh && ./run_server.sh`

---

### Ataxx Game Rules

- Players alternate turns moving their pieces
- Pieces can clone (adjacent) or jump (2 squares max)
- Moving converts all adjacent opponent pieces to your color
- Game ends when no moves available
- Most pieces wins

---

![alt text](/static/projects/ataxx.png)
A screenshot of the webserver in action. To move, click a square and then click again to move to a new location. When playing against the engine, the engine will display the principle variation (current estimate of optimal play) in the right-hand side display.

---
