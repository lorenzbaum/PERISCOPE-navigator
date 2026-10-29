# PERISCOPE Navigator: Privacy-Friendly Business Model Recommender

[![Live Demo](https://img.shields.io/badge/Demo-privacy.wiim--research.de-blue.svg)](https://privacy.wiim-research.de/)
[![Backup Demo](https://img.shields.io/badge/Mirror-privacy--recommender.web.app-orange.svg)](https://privacy-recommender.web.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-18-dd0031.svg?logo=angular)](https://angular.dev/)
[![Firebase](https://img.shields.io/badge/Hosted_on-Firebase-ffca28.svg?logo=firebase)](https://firebase.google.com/)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23739123.svg)](https://doi.org/10.5281/zenodo.23739123)

An open-source, interactive web-based recommender system designed to evaluate and enhance the **privacy-friendliness of platform business models**. Calibrated using empirical consumer preferences from Adaptive Choice-Based Conjoint (ACBC) experiments, the system computes a privacy score across more than 90,000 business model configurations and generates actionable recommendations to help platforms compete on privacy without sacrificing value creation.

Developed by the **Chair of Information Systems and Information Management (WIIM)** at **Goethe University Frankfurt** as part of the research project **PERISCOPE**, funded by the German Federal Ministry of Education and Research (BMBF).

---

## 🌐 Live Application

- **Primary URL**: [https://privacy.wiim-research.de/](https://privacy.wiim-research.de/)
- **Backup / Fallback**: [https://privacy-recommender.web.app/](https://privacy-recommender.web.app/)

The application is fully localized and available in both **English** and **German**.

---

## 🔬 Scientific Publications

This software artifact is part of the research conducted within the PERISCOPE project. If you use this tool, its methodology, or the data in your academic work, please cite the following publications:

### Primary Publication (ICIS 2024)
> **A Recommender System for Privacy-Friendly Platform Business Models**  
> Lorenz Baum, Björn Hanneke, Oliver Hinz  
> *Proceedings of the 45th International Conference on Information Systems (ICIS 2024)*, Bangkok, Thailand.  
> 📄 **Paper**: [https://aisel.aisnet.org/icis2024/security/security/3/](https://aisel.aisnet.org/icis2024/security/security/3/)

### Foundations & Conceptual Work (DuD 2024)
> **Privatsphärenfreundliche Plattformgeschäftsmodelle**  
> Björn Hanneke, Lorenz Baum, Christian H. Schunck, Oliver Hinz  
> *Datenschutz und Datensicherheit – DuD*, 48(2), pp. 89–94 (2024).  
> 📄 **DOI**: [https://doi.org/10.1007/s11623-023-1887-5](https://doi.org/10.1007/s11623-023-1887-5)

---

## 📖 Overview & Methodology

Compliance with privacy regulations such as the EU General Data Protection Regulation (GDPR) poses substantial challenges for small and medium-sized enterprises (SMEs) and start-ups. The PERISCOPE Navigator bridges this gap by translating consumer privacy perceptions into concrete design recommendations for digital platforms.

```
+-------------------------------------------------------------+
| 1. Business Model Configuration (Survey Input)              |
|    - Industry Sector, Monetization, Data Sources            |
|    - Data Types, Uses (Internal/External), Anonymization    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 2. Scientific Calibration Engine (ACBC Utilities)          |
|    - Compares input against 90,000+ possible configurations |
|    - Evaluates part-worth utility distribution              |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| 3. Privacy Score & Recommendations                          |
|    - Percentile Rank / Privacy-Friendliness Score (0 - 100) |
|    - Concrete, prioritized trade-off suggestions            |
+-------------------------------------------------------------+
```

### Key Dimensions Evaluated
- **Industry Sector**: Primary sector, energy, trade, transport, services, media, finance, public, education, health.
- **Monetization**: Direct monetization, direct monetization on other market side, indirect monetization.
- **Privacy Settings**: Granular user control vs. no control.
- **Data Sources**: Internal data, internal + public, internal + public + external data brokers.
- **Data Types Collected**: Demographics, preferences, contact information, community interaction, financial details, secure identifiers, special categories (GDPR Art. 9).
- **Internal Data Use**: Personalization / UX vs. pure business operations.
- **External Data Sharing**: Raw data, analyzed/aggregated data, or no external use.
- **External Data Recipients**: Value chain partners, platform users, or general public.
- **Transfer Frequency**: On request vs. continuous transfer.
- **Data Anonymization**: Anonymized vs. non-anonymized.

---

## 🛠 Tech Stack & Architecture

- **Frontend Framework**: [Angular 18](https://angular.dev/) (Standalone Components, Signals, Reactive Forms)
- **UI Components & Styling**: [Angular Material](https://material.angular.io/), SCSS, Responsive Grid Layout
- **Visualizations**: [Chart.js](https://www.chartjs.org/) & `chartjs-gauge` for interactive speedometer gauges
- **Internationalization (i18n)**: Angular `@angular/localize` (English & German) with [Localazy](https://localazy.com/) CLI integration
- **Hosting & Infrastructure**: [Firebase Hosting](https://firebase.google.com/docs/hosting) with multi-locale routing
- **PWA**: Service Worker (`@angular/service-worker`) for offline capabilities and caching
- **Analysis Pipeline**: Python 3 (`analyzer.py`) using `pandas`, `numpy`, and `itertools` to compute utility distributions and quantiles from ACBC raw data

---

## 📁 Repository Structure

```
PERISCOPE-navigator/
├── .github/workflows/       # GitHub Actions CI workflow
├── public/                  # Static assets (images, logos, partner graphics)
├── src/
│   ├── app/
│   │   ├── footer/          # Footer component with contact & BMBF attribution
│   │   ├── home/            # Welcome page with motivation, methodology, partners
│   │   ├── recommender/     # Interactive multi-step configuration survey
│   │   ├── results/         # Results dashboard (gauge chart & recommendations)
│   │   │   └── gauge/       # Chart.js gauge visualization component
│   │   ├── toolbar/         # Header navigation and language selector
│   │   ├── analysis.service.ts # Core scoring & recommendation algorithm
│   │   └── global.service.ts   # Global application state management
│   ├── environments/        # Firebase environment configuration
│   ├── locale/              # XLIFF translation files (messages.xlf, messages.de.xlf)
│   └── index.html           # HTML entry point with metadata & PWA tags
├── analyzer.py              # Offline ACBC utility & quantile calculation script
├── angular.json             # Angular CLI workspace configuration
├── CITATION.cff             # Citation File Format metadata for GitHub & Zenodo
├── firebase.json            # Firebase Hosting configuration
├── quantiles.json           # Precomputed quantile distribution lookup tables
├── utilities.json           # Part-worth utilities per attribute level
├── localazy.keys.example.json # Example keys for Localazy translation CLI
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **npm**: `v9.x` or later
- **Python**: `3.9+` (optional, only required if recalculating utility distributions via `analyzer.py`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lorenzbaum/PERISCOPE-navigator.git
   cd PERISCOPE-navigator
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development Server

Run the local development server:
```bash
pnpm start
# or: npx ng serve
```
Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you modify any source files.

### Production Build

Build the project with full internationalization (English & German):
```bash
pnpm run build
```
The localized build artifacts are generated in the `dist/` directory:
- `dist/browser/` (default / English)
- `dist/browser/de/` (German locale)

### Running Unit Tests

Run Karma/Jasmine tests:
```bash
pnpm test
```

---

## 📊 Offline Analysis Pipeline (`analyzer.py`)

The application consumes pre-calculated empirical part-worth utilities (`utilities.json`) and quantile distributions (`quantiles.json`) derived from Adaptive Choice-Based Conjoint (ACBC) surveys.

If you have fresh conjoint estimation results (e.g. from Sawtooth Software or Hierarchical Bayes estimation):
1. Install Python dependencies:
   ```bash
   pip install numpy pandas
   ```
2. Run the analyzer script:
   ```bash
   python analyzer.py
   ```
3. Enter the path to your estimation CSV, specify the country code, and choose whether to include the `NONE` alternative.
4. The script updates `utilities.json` and calculates the 101 quantiles across all ~90,000 combinations into `quantiles.json`.

---

## 🌐 Deployment to Firebase

The application is deployed on Firebase Hosting.

1. Ensure the [Firebase CLI](https://firebase.google.com/docs/cli) is installed and authenticated:
   ```bash
   pnpm install -g firebase-tools
   firebase login
   ```
2. Build and deploy:
   ```bash
   pnpm run deploy
   ```
   *(This script temporarily enables Angular localization, executes `ng deploy` to Firebase Hosting, and restores configuration).*

---

## 📚 Citation

If you use PERISCOPE Navigator in your research, please cite the ICIS 2024 paper and/or this software repository:

### BibTeX

```bibtex
@inproceedings{baum2024recommender,
  author    = {Baum, Lorenz and Hanneke, Bj{\"o}rn and Hinz, Oliver},
  title     = {A Recommender System for Privacy-Friendly Platform Business Models},
  booktitle = {Proceedings of the 45th International Conference on Information Systems (ICIS 2024)},
  year      = {2024},
  address   = {Bangkok, Thailand},
  publisher = {Association for Information Systems (AISeL)},
  url       = {https://aisel.aisnet.org/icis2024/security/security/3/}
}

@article{hanneke2024privatsphaerenfreundliche,
  author    = {Hanneke, Bj{\"o}rn and Baum, Lorenz and Schunck, Christian H. and Hinz, Oliver},
  title     = {Privatsph{\"a}renfreundliche Plattformgesch{\"a}ftsmodelle},
  journal   = {Datenschutz und Datensicherheit -- DuD},
  volume    = {48},
  number    = {2},
  pages     = {89--94},
  year      = {2024},
  doi       = {10.1007/s11623-023-1887-5}
}

@software{baum2024periscope_navigator,
  author    = {Baum, Lorenz and Hanneke, Bj{\"o}rn and Hinz, Oliver},
  title     = {PERISCOPE Navigator: A Recommender System for Privacy-Friendly Platform Business Models},
  year      = {2024},
  version   = {0.7.7},
  publisher = {Zenodo},
  url       = {https://github.com/lorenzbaum/PERISCOPE-navigator}
}
```

---

## 🏛 Funding & Project Partners

This work was supported by the **German Federal Ministry of Education and Research (BMBF)** under the research initiative *“IT-Sicherheit und Privatheit: Vertrauenswürdige Plattformen”* (Project: **PERISCOPE**).

- **Goethe University Frankfurt** – Chair of Information Systems and Information Management (Prof. Dr. Oliver Hinz)
- **Fraunhofer IAO** (Institute for Industrial Engineering)
- **University of Stuttgart**
- **University of Kassel**
- **Rohrbeck & Rohrbeck**
- **Widas**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the `LICENSE` file for details.

---

## ✉️ Contact & Support

For questions regarding the scientific methodology, conjoint calibration, or bug reports:
- **Lorenz Baum** – Goethe University Frankfurt – [baum@wiwi.uni-frankfurt.de](mailto:baum@wiwi.uni-frankfurt.de)
- **Website**: [https://www.wiim.uni-frankfurt.de/](https://www.wiim.uni-frankfurt.de/)
