---
title: Practical Linear Algebra for Machine Learning
description: A cheatsheet for applied (ML) linear algebra
date: DRAFT - POST_DATE
category: Mathematics
tags: [linear-algebra, machine-learning, math]
---

This is a draft post. Replace this content with your draft.

- Regular markdown elements
- Mathematical expressions using MathJax: $E = mc^2$
- Display equations: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$
- Code blocks with syntax highlighting

## A Change of Notation

- Matrix math can be made much more concise and intuitive by using column notation (and or row notation depending on the situation).
- This is useful when engineering neural network layers that use operations that are not traditionally covered in linear algebra classes, like concatenation of vectors (direct sum) and Kronecker products.

### Column notation:
Let $\begin{equation}A = \begin{pmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}.\end{equation}$ 
Written in column vector notation, ${A = \begin{pmatrix}
| & | & & | \\
\mathbf{a}_1 & \mathbf{a}_2 & \cdots & \mathbf{a}_n \\
| & | & & |
\end{pmatrix}}$, where $\mathbf{a}_{j} = \begin{pmatrix} a_{1j} \\ \vdots \\ a_{mj} \end{pmatrix}$ is the $j$th column vector of $A$. Recalling the component-wise definition of matrix-vector multiplication:
$$\begin{equation}\left(A\mathbf{x}\right)_{i} := \sum_{j=1}^n a_{ij}x_j, \label{eq:matvec-component}\end{equation}$$ one utility of column notation is that we can rewrite this as
$$\begin{equation}A\mathbf{x} := \sum_{j=1}^n \mathbf{a}_j x_j. \label{eq:matvec-column}\end{equation}$$ I've written a 'proof by notation' below, which is essentially just an exercise in bookkeeping. Equation \eqref{eq:matvec-column} makes several things obvious by inspection: 
- Matrix-vector multiplication is simply a weighted sum of the columns of the matrix by the components of the vector. The set of vectors which can be written as a linear combination of the columns of the matrix is precisely the 'column space' of the matrix, defined as $\text{col}(A) = \text{span}(\mathbf{a}_1, \mathbf{a}_2, \cdots, \mathbf{a}_n)$. Therefore, the result of matrix-vector multiplication lives in the column space of the matrix.
- If a matrix is not full rank (columns do not span $\mathbb{R}^m$), then there are vectors which cannot be written as a linear combination of the columns of the matrix.
- It follows that $Ax$ is not invertible for all $x \in \mathbb{R}^m$ unless the column space of $A$, $\text{col}(A) = \mathbb{R}^m$.

**Proof of \eqref{eq:matvec-column}:**
If we stack the component-wise definitions for each component of the result vector and use our notation for column vectors in general, we get
$$\begin{align}
A\mathbf{x} &:= \begin{pmatrix} \left(A\mathbf{x}\right)_{1} \\ \vdots \\ \left(A\mathbf{x}\right)_{m} \end{pmatrix} \nonumber \\
&= \begin{pmatrix} \sum_{j=1}^n a_{1j}x_j \\ \vdots \\ \sum_{j=1}^n a_{mj}x_j \end{pmatrix} \qquad \text{(using \eqref{eq:matvec-component})} \nonumber \\
&:= \sum_{j=1}^n \begin{pmatrix} a_{1j} \\ \vdots \\ a_{mj} \end{pmatrix} x_j  \nonumber \\
&= \sum_{j=1}^n x_j \mathbf{a}_j.  \nonumber \\
\end{align}$$

## Section Headings

Your draft content here...

### Subsections

More draft content...

## Code Examples

Here's a Python example:

```python
# Code examples
import numpy as np
import matplotlib.pyplot as plt

def example_function():
    return "Hello, World!"
```

## Publishing Notes

When ready to publish:

1. Edit this markdown file
2. Remove "DRAFT:" from the frontmatter
3. Update the date to the actual date
4. Add the post to the posts listing in `posts.html`
5. Access via `/post.html?file=practical-ml-linalg`
