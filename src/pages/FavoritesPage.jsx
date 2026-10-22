import { Row, Col, Empty } from "antd";
import { useStore } from "../store/useStore";
import ProductCard from "./ProductCard";

export default function FavoritesPage() {
  const favorites = useStore((state) => state.favorites);

  return (
    <>
      <h2>Избранное</h2>
      {favorites.length ? (
        <Row gutter={[16, 16]}>
          {favorites.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="Избранное пусто" />
      )}
    </>
  );
}
