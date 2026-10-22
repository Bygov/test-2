import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Select, Button, Spin, message } from "antd";
import {
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
} from "../api/products";
import { isOwnProduct, saveOwnProduct } from "./ProductCard";

export default function ProductFormPage({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [form] = Form.useForm();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: product, isPending } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: editing && isOwnProduct(Number(id)),
  });

  useEffect(() => {
    if (!editing) return;

    if (!isOwnProduct(Number(id))) {
      message.error("Можно редактировать только свои товары");
      navigate("/products", { replace: true });
      return;
    }

    if (product) {
      form.setFieldsValue({
        title: product.title,
        price: product.price,
        description: product.description,
        categoryId: product.category?.id,
        image: product.images?.[0],
      });
    }
  }, [editing, id, product, form, navigate]);

  const mutation = useMutation({
    mutationFn: (values) => {
      const data = {
        title: values.title,
        price: values.price,
        description: values.description,
        categoryId: values.categoryId,
        images: [values.image],
      };

      return editing ? updateProduct({ id, data }) : createProduct(data);
    },
    onSuccess: (saved) => {
      if (!editing) saveOwnProduct(saved.id);

      client.invalidateQueries({ queryKey: ["products"] });
      client.invalidateQueries({ queryKey: ["product"] });

      message.success(editing ? "Товар обновлён" : "Товар создан");
      navigate(`/products/${saved.id}`);
    },
    onError: () => message.error("Не удалось сохранить товар"),
  });

  if (editing && isPending) return <Spin />;

  return (
    <div className="form">
      <h2>{editing ? "Редактировать товар" : "Новый товар"}</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => mutation.mutate(values)}
      >
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Nasirov Blue Shirt" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Цена"
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: "Введите описание" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Категория"
          rules={[{ required: true, message: "Выберите категорию" }]}
        >
          <Select
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item
          name="image"
          label="URL изображения"
          rules={[
            { required: true, message: "Введите ссылку" },
            { type: "url", message: "Некорректный URL" },
          ]}
        >
          <Input />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          Сохранить
        </Button>
      </Form>
    </div>
  );
}
