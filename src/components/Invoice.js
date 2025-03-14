import React, { useState, useContext, useRef } from "react";
import ClientDetails from "./ClientDetails";
import Dates from "./Dates";
import Footer from "./Footer";
import Header from "./Header";
import MainDetails from "./MainDetails";
import Notes from "./Notes";
import Table from "./Table";
import TableForm from "./TableForm";
import ReactToPrint from "react-to-print";
import { State } from "../context/stateContext";

function Invoice() {
  const {
    name,
    setName,
    address,
    setAddress,
    email,
    setEmail,
    phone,
    setPhone,
    bankName,
    setBankName,
    bankAccount,
    setBankAccount,
    website,
    setWebsite,
    clientName,
    setClientName,
    clientAddress,
    setClientAddress,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    notes,
    setNotes,
    componentRef,
    list, setList, // Get list from context
  } = useContext(State);

  const [inputColor, setInputColor] = useState("black"); // Initial color


  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);

    try {
      // 1. Create Client
      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: clientName,
          client_address: clientAddress,
          bank_name: bankName,
          bank_account_number: bankAccount,
        }),
      });
      const clientData = await clientResponse.json();
      const clientId = clientData.insertId;

      // 2. Create Invoice
      const invoiceResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_id: localStorage.getItem("vendorId"),
          client_id: clientId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          due_date: dueDate,
          notes: notes,
        }),
      });
      const invoiceData = await invoiceResponse.json();
      const invoiceId = invoiceData.insertId;

      // 3. Create Invoice Items (from list)
      for (const item of list) {
        await fetch("/api/invoice-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoice_id: invoiceId,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount,
          }),
        });
      }

      // 4. Trigger print after data is saved
      setTimeout(() => {
        setIsPrinting(false);
        componentRef.current.focus();
        window.print();
      }, 500);
    } catch (error) {
      console.error("Error saving invoice data:", error);
      setIsPrinting(false);
    }
  };

  const invoiceNumberInputRef = useRef(null); // Create a ref for the input

  const handleInvoiceNumberFocus = () => {
      if (!invoiceNumber) {
          setInvoiceNumber(generateInvoiceId());
      }
      
  };

  function generateInvoiceId() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let invoiceId = '';
      for (let i = 0; i < 8; i++) {
          invoiceId += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return invoiceId;
  }
  const handleInvoiceNumberChange = async (e) => {
    const newInvoiceNumber = e.target.value;
    setInvoiceNumber(newInvoiceNumber);

    if (newInvoiceNumber.length === 8) {
      setInputColor("black"); // Reset color

      try {
        const response = await fetch(`/api/invoices/${newInvoiceNumber}`);
        if (response.ok) {
          const invoiceData = await response.json();

          if (invoiceData) {
            setName(invoiceData.vendor.name);
            setAddress(invoiceData.vendor.address);
            setEmail(invoiceData.vendor.email);
            setPhone(invoiceData.vendor.phone);
            setWebsite(invoiceData.vendor.website);

            setClientName(invoiceData.client.client_name);
            setClientAddress(invoiceData.client.client_address);
            setBankName(invoiceData.client.bank_name);
            setBankAccount(invoiceData.client.bank_account_number);

            setInvoiceDate(invoiceData.invoice.invoice_date);
            setDueDate(invoiceData.invoice.due_date);
            setNotes(invoiceData.invoice.notes);

            const itemsResponse = await fetch(`/api/invoice-items/${newInvoiceNumber}`);
            if (itemsResponse.ok) {
              const itemsData = await itemsResponse.json();
              setList(itemsData);
            } else {
              console.error("Failed to fetch invoice items");
              setList([]);
            }
          } else {
            clearAllFields();
          }
        } else {
          console.error("Failed to fetch invoice data");
          clearAllFields();
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        clearAllFields();
      }
    } else {
      setInputColor("red"); // Set color to red
      clearAllFields();
    }
  };

  const clearAllFields = () => {
    setName("");
    setAddress("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setClientName("");
    setClientAddress("");
    setBankName("");
    setBankAccount("");
    setInvoiceDate("");
    setDueDate("");
    setNotes("");
    setList([]);
  };

  return (
    <>
      <main
        className="m-5 p-5 xl:grid grid-cols-2 gap-10 xl:items-start"
        style={{
          maxWidth: "1920px",
          margin: "auto",
        }}
      >
        <section>
          <div className="bg-white p-5 rounded shadow">
            <div className="flex flex-col justify-center">
              <article className="md:grid grid-cols-2 gap-10">
                <div className="flex flex-col">
                  <label htmlFor="name">Your full name</label>
                  <input
                    type="text"
                    name="text"
                    id="name"
                    placeholder="Enter your name"
                    maxLength={56}
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="address">Enter your address</label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="Enter your address"
                    autoComplete="off"
                    maxLength={96}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </article>

              <article className="md:grid grid-cols-3 gap-10">
                <div className="flex flex-col">
                  <label htmlFor="email">Enter your email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    maxLength={255}
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="website">Enter your website</label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    placeholder="Enter your website"
                    maxLength={96}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="phone">Enter your phone</label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Enter your phone"
                    maxLength={12}
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </article>

              <article className="md:grid grid-cols-2 gap-10">
                <div className="flex flex-col">
                  <label htmlFor="bankName">Enter your bank name</label>
                  <input
                    type="text"
                    name="bankName"
                    id="bankName"
                    placeholder="Enter your bank name"
                    maxLength={56}
                    autoComplete="off"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="bankAccount">
                    Enter your bank account number
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    id="bankAccount"
                    placeholder="Enter your bank account number"
                    maxLength={20}
                    autoComplete="off"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              </article>

              <article className="md:grid grid-cols-2 gap-10 md:mt-16">
                <div className="flex flex-col">
                  <label htmlFor="clientName">Enter your client's name</label>
                  <input
                    type="text"
                    name="clientName"
                    id="clientName"
                    placeholder="Enter your client's name"
                    maxLength={56}
                    autoComplete="off"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="clientAddress">
                    Enter your client's address
                  </label>
                  <input
                    type="text"
                    name="clientAddress"
                    id="clientAddress"
                    placeholder="Enter your client's address"
                    maxLength={96}
                    autoComplete="off"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                  />
                </div>
              </article>

              <article className="md:grid grid-cols-3 gap-10">
                <div className="flex flex-col">
                  <label htmlFor="invoiceNumber">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    id="invoiceNumber"
                    placeholder="Invoice Number"
                    autoComplete="off"
                    value={invoiceNumber}
                    onChange={handleInvoiceNumberChange}
                    onFocus={handleInvoiceNumberFocus} // Add onFocus event
                    style={{ color: inputColor }}
                    ref={invoiceNumberInputRef} // Attach ref to input
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="invoiceDate">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    id="invoiceDate"
                    placeholder="Invoice Date"
                    autoComplete="off"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    placeholder="Invoice Date"
                    autoComplete="off"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </article>

              {/* This is our table form */}
              <article>
                <TableForm />
              </article>

              <label htmlFor="notes">Additional Notes</label>
              <textarea
                name="notes"
                id="notes"
                cols="30"
                rows="10"
                placeholder="Additional notes to the client"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </section>

        {/* Invoice Preview */}
        <div className="invoice__preview bg-white p-5 rounded-2xl border-4 border-blue-200">
          <ReactToPrint
            trigger={() => (
              <button className="bg-blue-500 ml-5 text-white font-bold py-2 px-8 rounded hover:bg-blue-600 hover:text-white transition-all duration-150 hover:ring-4 hover:ring-blue-400"
              onClick={handlePrint}
              disabled={isPrinting}
              >
                Print / Download
              </button>
            )}
            content={() => componentRef.current}
          />
          <div ref={componentRef} className="p-5">
            <Header />

            <MainDetails />

            <ClientDetails />

            <Dates />

            <Table />

            <Notes />

            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}

export default Invoice;
