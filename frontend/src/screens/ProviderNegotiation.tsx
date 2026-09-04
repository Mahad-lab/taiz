import { useApp } from '@/state/AppContext';

export default function ProviderSettings() {
  const { user, businessId } = useApp();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <section>
        <h3 className="text-lg font-semibold">Profile</h3>
        <p className="text-sm text-stone-600">Manage your provider profile and visibility.</p>
      </section>
      <section>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-stone-600">Configure request alerts and response settings.</p>
      </section>
      {businessId && (
        <section>
          <h3 className="text-lg font-semibold">Linked Business</h3>
          <p className="text-sm text-stone-600">Business ID: {businessId}</p>
        </section>
      )}
      {user && (
        <section>
          <h3 className="text-lg font-semibold">Account</h3>
          <p className="text-sm text-stone-600">Signed in as {user.name}</p>
        </section>
      )}
    </div>
  );
}
