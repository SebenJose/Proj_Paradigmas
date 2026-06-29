import { UserProfileView } from "@/features/users";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <UserProfileView username={username} />;
}
