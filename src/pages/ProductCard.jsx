import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Space,
  Tag,
  Popconfirm,
  message,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../api/products";
import { useStore } from "../store/useStore";

const { Text } = Typography;

export function getOwnProducts() {
  try {
    return JSON.parse(localStorage.getItem("own-products") || "[]");
  } catch {
    return [];
  }
}

export function isOwnProduct(id) {
  return getOwnProducts().includes(Number(id));
}

export function saveOwnProduct(id) {
  const products = getOwnProducts();

  localStorage.setItem(
    "own-products",
    JSON.stringify([...new Set([...products, Number(id)])])
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const client = useQueryClient();

  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const addToCart = useStore((state) => state.addToCart);

  const favorite = favorites.some((item) => item.id === product.id);

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["products"] });
      client.removeQueries({ queryKey: ["product", String(product.id)] });
      message.success("Товар удалён");
    },
    onError: () => message.error("Не удалось удалить товар"),
  });

  return (
    <Card
      hoverable
      style={{
        height: "100%",
        overflow: "hidden",
        border: "1px solid #eee",
        borderRadius: 16,
      }}
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 16,
        },
        cover: {
          background: "#fff",
        },
      }}
      cover={
        <div
          style={{
            height: 220,
            padding: 20,
            position: "relative",
            background: "#fff",
          }}
        >
          <Link to={`/products/${product.id}`}>
            <img
              src={product.images?.[0]}
              alt={product.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </Link>

          <Button
            shape="circle"
            icon={favorite ? <HeartFilled /> : <HeartOutlined />}
            danger={favorite}
            onClick={() => toggleFavorite(product)}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#fff",
            }}
          />
        </div>
      }
    >
      {product.category?.name && (
        <Tag style={{ width: "fit-content", margin: 0 }}>
          {product.category.name}
        </Tag>
      )}

      <Link to={`/products/${product.id}`}>
        <Text
          strong
          ellipsis={{ tooltip: product.title }}
          style={{ display: "block", fontSize: 15, minHeight: 24 }}
        >
          {product.title}
        </Text>
      </Link>

      <Text
        strong
        style={{ fontSize: 23, color: "#635bff", marginTop: "auto" }}
      >
        ${product.price}
      </Text>

      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        block
        onClick={() => {
          addToCart(product);
          message.success("Добавлено в корзину");
        }}
      >
        В корзину
      </Button>

      {isOwnProduct(product.id) && (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${product.id}/edit`)}
          >
            Изменить
          </Button>

          <Popconfirm
            title="Удалить товар?"
            description="Это действие нельзя отменить."
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={() => remove.mutate(product.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={remove.isPending}
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )}
    </Card>
  );
}