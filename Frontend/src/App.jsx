import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
