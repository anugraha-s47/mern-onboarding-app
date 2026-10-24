
# Record – Multi-Step Onboarding Application

Record is a full-stack MERN web application that allows users to create an account, log in, complete a multi-step onboarding form, and view a completion dashboard.

The application focuses on providing a smooth and responsive user experience while ensuring that form responses are securely stored in a database and retained when users navigate between steps or revisit the application.

## Features

- **User Registration:** Create an account using name, email, and password.
- **Secure Login:** Authenticate users using their registered credentials.
- **Multi-Step Form:** Complete onboarding through a sequence of interactive form screens.
- **Persistent Data Storage:** Save form responses to MongoDB so previously entered information can be retrieved.
- **Form Validation:** Validate required fields before proceeding to the next step or submitting the form.
- **Seamless Navigation:** Move between form steps while retaining previously saved responses.
- **Completion Dashboard:** Display a confirmation screen after successful onboarding.
- **Responsive Design:** Access the application across desktop, tablet, and mobile devices.

## Tech Stack

- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Security:** bcrypt

## Application Flow

1. Create an account.
2. Log in using registered credentials.
3. Complete the onboarding form.
4. Save and retrieve responses as you navigate between steps.
5. Submit the completed form.
6. View the completion dashboard.

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB or a MongoDB Atlas database

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Install the dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Configure the required environment variables using the provided `.env.example` files.

Start the application:

```bash
npm run dev
```

Configure MongoDB and ensure the frontend and backend are running before using the application.

## Project Objective

This project demonstrates the development of a full-stack web application with user authentication, multi-step form handling, persistent database storage, server-side validation, and responsive UI design.

## Design Reference

[Figma – Onboarding Application](https://www.figma.com/design/Hfe8CgEAKtuJJQ3nFz5rxL/Onboarding-task?node-id=0-1&t=vai8gx4nY6rtl7Fj-1)

## Author

Developed as a full-stack web development project using the MERN stack.

