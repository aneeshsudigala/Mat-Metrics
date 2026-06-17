# Mat Metrics

An Interactive Explorer For NCAA Division 1 Wrestling Championship Results

## Screen Capture

![Screen Capture](https://github.com/aneeshsudigala/Mat-Metrics/blob/main/screencapture.png)

## Setup

### 1. Clone The Repository

```bash
git clone https://github.com/aneeshsudigala/Mat-Metrics
cd Mat-Metrics
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run The App

```bash
npm run dev
```

## File Structure

```
mat-metrics/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── ncaa_data.csv
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AthletesView.tsx
│   │   ├── VisualizationsView.tsx
│   │   └── YearView.tsx
│   ├── data/
│   │   ├── WrestlingDataContext.tsx
│   │   └── wrestlingData.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```
