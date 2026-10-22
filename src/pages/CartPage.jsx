import { Link } from "react-router-dom";
import { Button, Empty, Space } from "antd";
import { useStore } from "../store/useStore";

export default function CartPage() {
  const { cart, changeQuantity, removeFromCart, clearCart } = useStore();

  const total = cart.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  if (!cart.length) return <Empty description="Корзина пуста" />;

  return (
    <>
      <h2>Корзина</h2>

      {cart.map((product) => (
        <div className="cart-item" key={product.id}>
          <Link to={`/products/${product.id}`}>{product.title}</Link>
          <span>${product.price}</span>

          <Space>
            <Button onClick={() => changeQuantity(product.id, product.quantity - 1)}>
              -
            </Button>
            {product.quantity}
            <Button onClick={() => changeQuantity(product.id, product.quantity + 1)}>
              +
            </Button>
            <Button danger onClick={() => removeFromCart(product.id)}>
              Удалить
            </Button>
          </Space>
        </div>
      ))}

      <h3>Итого: ${total.toFixed(2)}</h3>
      <Button danger onClick={clearCart}>Очистить корзину</Button>
    </>
  );
}