import React from "react";

const PayUForm = () => {
  const handleCheckout = async () => {
    const txnid = "txn" + Date.now();
    const amount = 100; // test amount
    const firstname = "Test User";
    const email = "test@example.com";
    const productinfo = "Famchase Product";

    // Call backend to get PayU form data
    const res = await fetch("http://localhost:5000/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txnid, amount, firstname, email, productinfo }),
    });

    const data = await res.json();

    // Build form dynamically and submit
    const form = document.createElement("form");
    form.action = data.url;
    form.method = "POST";

    Object.keys(data.params).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data.params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div>
      <h2>Famchase Checkout</h2>
      <button onClick={handleCheckout}>Pay with PayU</button>
    </div>
  );
};

export default PayUForm;
