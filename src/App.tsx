import { Route, Routes } from "react-router-dom";
import { BouquetProvider } from "./state/BouquetContext";
import HomePage from "./pages/HomePage";
import OrderSuccess from "./pages/OrderSuccess";
import AdminApp from "./pages/admin/AdminApp";

export default function App() {
  return (
    <BouquetProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BouquetProvider>
  );
}
