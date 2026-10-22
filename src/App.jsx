import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, Layout, theme } from "antd";

import Header from "./components/Header";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductFormPage from "./pages/ProductFormPage";
import FavoritesPage from "./pages/FavoritesPage";
import CartPage from "./pages/CartPage";

import "./index.css";

const client = new QueryClient();

const { Content, Footer } = Layout;

export default function App() {
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#635bff",
            borderRadius: 12,
            fontFamily: "Inter, Arial, sans-serif",
            colorBgContainer: "#ffffff",
          },
        }}
      >
        <BrowserRouter>
          <Layout style={{ minHeight: "100vh", background: "#f6f7fb" }}>
            <Header />

            <Content
              style={{
                width: "100%",
                maxWidth: 1440,
                margin: "0 auto",
                padding: "32px 24px",
                flex: 1,
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/create" element={<ProductFormPage />} />
                <Route
                  path="/products/:id"
                  element={<ProductDetailPage />}
                />
                <Route
                  path="/products/:id/edit"
                  element={<ProductFormPage editing />}
                />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="*" element={<Navigate to="/products" replace />} />
              </Routes>
            </Content>

            <Footer
              style={{
                textAlign: "center",
                color: "#888",
                background: "#fff",
                borderTop: "1px solid #eee",
              }}
            >
              Mini Market © 2026 — Ваши покупки в одном месте
            </Footer>
          </Layout>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}