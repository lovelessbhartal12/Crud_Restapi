import Items from "./components/Items";
import { useState, useEffect, useRef } from "react";
import Form from "./components/Form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const BASE_URL = "http://127.0.0.1:8000/api/grocery";

const App = () => {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editId]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${BASE_URL}/`);
        if (!res.ok) throw new Error("Failed to fetch items");

        const data = await res.json();
        setItems(data);
      } catch (err) {
        toast.error("Could not load grocery list");
      }
    };

    fetchItems();
  }, []);

  const addItem = async (itemName) => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: itemName,
          completed: false,
        }),
      });

      if (!res.ok) throw new Error();

      const newItem = await res.json();

      setItems((prev) => [...prev, newItem.data || newItem]);

      toast.success("Grocery item added");
    } catch (err) {
      toast.error("Error adding item");
    }
  };

  const editCompleted = async (itemId) => {
    try {
      const item = items.find((i) => i.id === itemId);

      const res = await fetch(`${BASE_URL}/${itemId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          completed: !item.completed,
        }),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? updated.data || updated : item,
        ),
      );
    } catch {
      toast.error("Update failed");
    }
  };

  const updateItemName = async (newName) => {
    try {
      const item = items.find((i) => i.id === editId);

      const res = await fetch(`${BASE_URL}/${editId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          name: newName,
        }),
      });

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setItems((prev) =>
        prev.map((i) => (i.id === editId ? updated.data || updated : i)),
      );

      setEditId(null);
      toast.success("Item updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/${itemId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setItems((prev) => prev.filter((item) => item.id !== itemId));

      toast.success("Item deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <section className="section-center">
      <ToastContainer position="top-center" />

      <Form
        addItem={addItem}
        updateItemName={updateItemName}
        editItemId={editId}
        itemToEdit={items.find((item) => item.id === editId)}
        inputRef={inputRef}
      />

      <Items
        items={items}
        editCompleted={editCompleted}
        removeItem={removeItem}
        setEditId={setEditId}
      />
    </section>
  );
};

export default App;
