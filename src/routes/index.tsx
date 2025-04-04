import { STORAGE_KEYS } from "@/lib/auth";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const isLoggedIn = () => {
    if (localStorage.getItem(STORAGE_KEYS.USER_ID)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <header className="text-center space-y-6">
        <h1 className="text-5xl font-bold">Welcome to PMS</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Streamline your projects, collaborate with your team, and achieve your
          goals efficiently with our Project Management System.
        </p>
        <div className="flex space-x-4 justify-center">
          {isLoggedIn() ? (
            <Link
              to="/app/dashboard"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold"
            >
              Get Started
            </Link>
          ) : (
            <>
              <Link
                to="/auth/register"
                className="bg-white border text-blue-600 border-white hover:bg-transparent hover:text-white px-6 py-2 rounded-lg font-semibold"
              >
                Sign Up
              </Link>

              <Link
                to="/auth/login"
                className="bg-transparent border border-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-lg font-semibold"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>
      <footer className="absolute bottom-4 text-sm text-gray-200">
        © {new Date().getFullYear()} PMS. All rights reserved.
      </footer>
    </div>
  );
}
