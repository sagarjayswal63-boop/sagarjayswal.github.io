# Sagar Jayswal — Portfolio

Static portfolio for an Automation & Controls Technician, designed for GitHub Pages.

## Edit portfolio content

Most project, experience, capability, and education content is stored in:

`assets/js/content.js`

Edit that file and commit the change. Layout and interactions are separated into:

- `assets/css/styles.css`
- `assets/js/main.js`

## Update the résumé

The printable browser version is `resume.html`. The downloadable PDF is:

`assets/Sagar-Jayswal-Automation-Resume.pdf`

On the original Windows development machine, the PDF can be regenerated with Microsoft Word:

```powershell
./scripts/export-resume.ps1
```

## Contact form

The contact form uses FormSubmit and sends to `sagarjayswal63@gmail.com`. FormSubmit may send a one-time activation email after the first submission. That activation email must be accepted before normal delivery begins.

## Publishing

GitHub Pages publishes the `main` branch of this repository.
