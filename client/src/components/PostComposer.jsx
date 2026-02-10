import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: ""
};

export default function PostComposer({ onCreatePost, isSubmitting }) {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreatePost(form);
    setForm(initialForm);
  }

  return (
    <section className="card">
      <h2>Create Listing</h2>
      <form className="grid-form" onSubmit={handleSubmit}>
        <input
          required
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Item title"
        />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (Books, Tech, etc.)"
        />
        <textarea
          required
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe what you're selling"
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Item"}
        </button>
      </form>
    </section>
  );
}
