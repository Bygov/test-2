import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Badge } from "antd";
import {
  ShoppingOutlined,
  HeartOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useStore } from "../store/useStore";

export default function Header() {
  const { pathname } = useLocation();
  const favorites = useStore((state) => state.favorites);
  const cart = useStore((state) => state.cart);

  const selected = pathname.startsWith("/favorites")
    ? "/favorites"
    : pathname.startsWith("/cart")
      ? "/cart"
      : "/products";

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Layout.Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 40,
        padding: "0 24px",
        background: "#fff",
        borderBottom: "1px solid #eee",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}
    >
      <Link
        to="/products"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#635bff",
          fontSize: 22,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        <AppstoreOutlined />
        Mini Market
      </Link>

      <Menu
        mode="horizontal"
        selectedKeys={[selected]}
        style={{ flex: 1, minWidth: 0, borderBottom: "none" }}
        items={[
          {
            key: "/products",
            icon: <AppstoreOutlined />,
            label: <Link to="/products">Каталог</Link>,
          },
          {
            key: "/favorites",
            icon: <HeartOutlined />,
            label: (
              <Link to="/favorites">
                Избранное <Badge count={favorites.length} size="small" />
              </Link>
            ),
          },
          {
            key: "/cart",
            icon: <ShoppingOutlined />,
            label: (
              <Link to="/cart">
                Корзина <Badge count={cartCount} size="small" />
              </Link>
            ),
          },
        ]}
      />
    </Layout.Header>
  );
}