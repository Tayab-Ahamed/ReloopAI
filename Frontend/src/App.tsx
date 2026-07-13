import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import AppRoutes from "./RBAC/AppRoutes";

const snackAnchor = { vertical: "top" as const, horizontal: "right" as const };

function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={snackAnchor}>
      <Router>
        <AppRoutes />
      </Router>
    </SnackbarProvider>
  );
}

export default App;
