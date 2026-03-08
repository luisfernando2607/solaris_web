# 🌞 Solaris Web

**Solaris Web** is the official frontend application for **Solaris
Platform ERP**.

Enterprise Angular-based frontend designed for scalability, modularity,
and integration with a RESTful backend API.

------------------------------------------------------------------------

## 🚀 Tech Stack

-   Angular
-   TypeScript
-   SCSS
-   REST API Integration
-   JWT Authentication
-   Modular Architecture

------------------------------------------------------------------------

## 📦 Installation

``` bash
npm install
ng serve
```

Application will run at:

    http://localhost:4200

------------------------------------------------------------------------

## 🏗️ Project Structure

    src/
     ├── app/
     │   ├── core/
     │   ├── shared/
     │   ├── modules/
     │   └── layout/
     ├── assets/
     └── environments/

------------------------------------------------------------------------

## 🔐 Environment Configuration

Edit:

    src/environments/environment.ts

Example:

``` ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

------------------------------------------------------------------------

## 📌 Features

-   Authentication & Authorization
-   Dashboard Module
-   Inventory Management
-   Orders Management
-   Administrative Panel
-   Responsive UI

------------------------------------------------------------------------

## 🧪 Development

Run development server:

``` bash
ng serve
```

Build for production:

``` bash
ng build --configuration production
```

------------------------------------------------------------------------

## 🏢 About Solaris Web Desktop

Solaris Web Desktop is an enterprise ERP ecosystem composed of:

-   Backend API (.NET)
-   Angular Frontend
-   PostgreSQL Database
-   CI/CD Pipeline Integration

------------------------------------------------------------------------

## 📄 License

Proprietary -- DevStar © 2026
# solaris_web
