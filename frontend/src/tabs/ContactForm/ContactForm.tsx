import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ name, email, message });
    // TODO: Add placeholder form submission logic
  };

  return (
    <section>
      <h2>Contact</h2>
      <p>Use the form below to send an inquiry.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Message
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
