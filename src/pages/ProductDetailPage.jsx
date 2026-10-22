import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Spin, Empty, message, Popconfirm } from "antd";
import { getProduct, deleteProduct } from "../api/products";
import { useStore } from "../store/useStore";
import { isOwnProduct } from "./ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { favorites, toggleFavorite, addToCart } = useStore();

  const { data: product, isPending } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
  });

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["products"] });
      message.success("Товар удалён");
      navigate("/products");
    },
    onError: () => message.error("Ошибка удаления"),
  });

  if (isPending) return <Spin />;
  if (!product) return <Empty description="Товар не найден" />;

  const favorite = favorites.some((p) => p.id === product.id);

  return (
    <>
      <Button onClick={() => navigate(-1)}>Назад</Button>
      <div className="detail">
        <img src={product.images?.[0]} alt={product.title} />
        <div>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <h3>${product.price}</h3>

          <Button
            onClick={() => {
              addToCart(product);
              message.success("Добавлено в корзину");
            }}
          >
            В корзину
          </Button>{" "}
          <Button onClick={() => toggleFavorite(product)}>
            {favorite ? "♥ Избранное" : "♡ В избранное"}
          </Button>

          {isOwnProduct(product.id) && (
            <>
              {" "}
              <Button onClick={() => navigate(`/products/${id}/edit`)}>
                Изменить
              </Button>{" "}
              <Popconfirm
                title="Удалить товар?"
                onConfirm={() => remove.mutate(Number(id))}
              >
                <Button danger loading={remove.isPending}>Удалить</Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </>
  );
}