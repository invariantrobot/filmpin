import '../index.css';

interface ProfileViewProps {
  model: unknown;
}

export function ProfileView(props: ProfileViewProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p className="text-gray-600">Your profile information.</p>
    </div>
  );
}
