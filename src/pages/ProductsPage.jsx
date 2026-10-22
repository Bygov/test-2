import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  Button,
  Spin,
  Empty,
  Typography,
  Space,
  Card,
  Alert,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getProducts, getCategories } from "../api/products";
import ProductCard from "./ProductCard";

const { Title, Text } = Typography;
const LIMIT = 12;

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Math.max(1, Number(params.get("page")) || 1);
  const title = params.get("title") || "";
  const categoryId = params.get("categoryId") || "";
  const priceMin = params.get("price_min") || "";
  const priceMax = params.get("price_max") || "";
  const sort = params.get("sort") || "default";

  const {
    data: categories = [],
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Загружаем большой список, чтобы фильтровать и сортировать
  // товары не только на текущей странице.
  const {
    data: products = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products", "catalog", title, categoryId],
    queryFn: () =>
      getProducts({
        offset: 0,
        limit: 200,
        ...(title.trim() && { title: title.trim() }),
        ...(categoryId && { categoryId: Number(categoryId) }),
      }),
  });

  function change(key, value) {
    const next = new URLSearchParams(params);

    if (value === "" || value === null || value === undefined) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }

    if (key !== "page") {
      next.set("page", "1");
    }

    setParams(next);
  }

  function clearFilters() {
    setParams({});
  }

  // Фильтрация по цене
  const filteredProducts = products.filter((product) => {
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);

    if (min !== null && product.price < min) {
      return false;
    }

    if (max !== null && product.price > max) {
      return false;
    }

    return true;
  });

  // Сортировка
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-asc") {
      return a.price - b.price;
    }

    if (sort === "price-desc") {
      return b.price - a.price;
    }

    if (sort === "title-asc") {
      return a.title.localeCompare(b.title);
    }

    return a.id - b.id;
  });

  // Пагинация после фильтрации и сортировки
  const start = (page - 1) * LIMIT;
  const visibleProducts = sortedProducts.slice(start, start + LIMIT);
  const totalPages = Math.ceil(sortedProducts.length / LIMIT);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <div>
          <Text type="secondary">ВСЁ НЕОБХОДИМОЕ В ОДНОМ МЕСТЕ</Text>

          <Title level={2} style={{ margin: "8px 0" }}>
            Каталог товаров
          </Title>

          <Text type="secondary">
            Найдите подходящий товар среди доступных предложений.
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/products/create")}
        >
          Добавить товар
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 16,
          marginBottom: 28,
          border: "1px solid #eee",
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Space style={{ marginBottom: 16 }}>
          <FilterOutlined />
          <Text strong>Поиск и фильтры</Text>
        </Space>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Название товара..."
              value={title}
              onChange={(event) => change("title", event.target.value)}
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="Категория"
              allowClear
              value={categoryId ? Number(categoryId) : undefined}
              onChange={(value) => change("categoryId", value)}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Col>

          <Col xs={12} sm={6} md={3}>
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              placeholder="Цена от"
              min={0}
              value={priceMin === "" ? null : Number(priceMin)}
              onChange={(value) => change("price_min", value)}
            />
          </Col>

          <Col xs={12} sm={6} md={3}>
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              placeholder="Цена до"
              min={0}
              value={priceMax === "" ? null : Number(priceMax)}
              onChange={(value) => change("price_max", value)}
            />
          </Col>

          <Col xs={24} md={6}>
            <Select
              size="large"
              style={{ width: "100%" }}
              value={sort}
              onChange={(value) => change("sort", value)}
              options={[
                { label: "По умолчанию", value: "default" },
                { label: "Сначала дешевле", value: "price-asc" },
                { label: "Сначала дороже", value: "price-desc" },
                { label: "По названию", value: "title-asc" },
              ]}
            />
          </Col>
        </Row>

        <Button
          type="link"
          onClick={clearFilters}
          style={{ paddingLeft: 0, marginTop: 8 }}
        >
          Сбросить фильтры
        </Button>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Товары
        </Title>

        <Text type="secondary">
          Найдено: {sortedProducts.length}
        </Text>
      </div>

      {isPending ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Alert
          type="error"
          showIcon
          message="Не удалось загрузить товары"
          action={
            <Button onClick={() => refetch()}>
              Повторить
            </Button>
          }
        />
      ) : visibleProducts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Товары не найдены"
        >
          <Button onClick={clearFilters}>Сбросить фильтры</Button>
        </Empty>
      ) : (
        <>
          <Row gutter={[20, 20]}>
            {visibleProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              marginTop: 32,
            }}
          >
            <Button
              size="large"
              disabled={page <= 1}
              onClick={() => change("page", page - 1)}
            >
              Назад
            </Button>

            <Text>
              Страница {page} из {Math.max(1, totalPages)}
            </Text>

            <Button
              size="large"
              disabled={page >= totalPages}
              onClick={() => change("page", page + 1)}
            >
              Далее
            </Button>
          </div>
        </>
      )}
    </div>
  );
}