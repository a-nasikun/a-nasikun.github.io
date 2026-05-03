# Dr. Ahmad Nasikun – Personal Academic Website

Personal academic website for Dr. Ahmad Nasikun, Assistant Professor at the Department of Electrical and Information Engineering (DTETI), Faculty of Engineering, Universitas Gadjah Mada (UGM), Indonesia.

**Live site:** https://nasikun.github.io *(update with your GitHub username)*

## Research Focus
- Geometry Processing
- Virtual Reality & Augmented Reality
- Deep Learning for Point Clouds
- Computer Graphics
- Numerical Methods for Engineering

## Structure

```
.
├── index.html          # Main single-page website
├── css/
│   └── style.css       # All styles (CSS custom properties, responsive)
├── js/
│   └── main.js         # Scroll animations, nav, pub filter
├── assets/
│   └── images/         # Profile photo and other assets (add your own)
└── README.md
```

## How to Update

### Add your profile photo
1. Add your photo to `assets/images/photo.jpg`
2. In `index.html`, replace the `🎓` emoji inside `.hero-photo` with:
   ```html
   <img src="assets/images/photo.jpg" alt="Dr. Ahmad Nasikun" style="width:100%;height:100%;object-fit:cover;" />
   ```

### Add a new publication
Copy one of the `.pub-item` blocks in the Publications section and update:
- `data-type="journal"` or `data-type="conference"`
- Year, title, authors, venue, and links

### Add a new course
Copy a `.course-card` block in the Teaching section and fill in the details.

### Add a research project
Copy a `.project-card` block in the Projects section.

## Deployment (GitHub Pages)

1. Push all files to a repository named `yourusername.github.io`
2. Go to **Settings → Pages**
3. Set source branch to `main`, folder to `/ (root)`
4. Your site will be live at `https://yourusername.github.io`

Any future `git push` automatically rebuilds the site within ~1 minute.

## Local Development

No build tools needed — just open `index.html` in a browser, or run a simple server:

```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000`.

---

© Dr. Ahmad Nasikun · Universitas Gadjah Mada
