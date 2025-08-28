import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.username}.</p>
        </div>
        <Button onClick={logout}>Logout</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All RDO Drafts</CardTitle>
          <CardDescription>
            This section will display all drafts from all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Admin functionality to be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
