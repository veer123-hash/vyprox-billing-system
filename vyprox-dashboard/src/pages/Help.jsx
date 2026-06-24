export default function Help() {
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">Help Center</h1>

      <div className="mt-4 space-y-4">

        <div className="p-4 border rounded">
          <h2 className="font-semibold">How to add product?</h2>
          <p>Go to Products → Click Add → Fill details → Save</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">How billing works?</h2>
          <p>Create invoice → stock auto reduce → GST apply</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Subscription system</h2>
          <p>Upgrade plan from Settings → Stripe payment → auto unlock features</p>
        </div>

      </div>

    </div>
  );
}