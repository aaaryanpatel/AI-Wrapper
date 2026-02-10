import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "Books",
  condition: "Used",
  location: "Saskatoon Campus"
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
    <section className="card composer">
      <h2>Create a New Listing</h2>
      <form className="grid-form" onSubmit={handleSubmit}>
        <input required name="title" value={form.title} onChange={handleChange} placeholder="Item title" />

        <div className="row two">
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
          <select name="category" value={form.category} onChange={handleChange}>
            <option>Books</option>
            <option>Tech</option>
            <option>Furniture</option>
            <option>Supplies</option>
            <option>General</option>
          </select>
        </div>

        <div className="row two">
          <select name="condition" value={form.condition} onChange={handleChange}>
            <option>New</option>
            <option>Like New</option>
            <option>Used</option>
            <option>Fair</option>
          </select>
          <input name="location" value={form.location} onChange={handleChange} placeholder="Campus/location" />
        </div>

        <textarea
          required
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe what you're selling"
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Publish Listing"}
        </button>
      </form>
    </section>
  );
}
