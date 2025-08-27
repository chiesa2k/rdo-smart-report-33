import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RDOFormData, getAllRdoDrafts } from '@/services/rdo-storage';
import { toast } from 'sonner';
import { generatePdfBlob } from '@/services/pdf-generator.tsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const [allDrafts, setAllDrafts] = useState<RDOFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would be a secure API call.
    // We also check if the user is an admin before fetching.
    if (user?.role !== 'admin') {
      toast.error("You are not authorized to view this page.");
      setIsLoading(false);
      return;
    }

    if (!isOnline) {
        toast.error("Offline: Cannot fetch latest data.");
        setIsLoading(false);
        return;
    }

    const fetchAllDrafts = async () => {
      setIsLoading(true);
      try {
        const drafts = await getAllRdoDrafts();
        drafts.sort((a, b) => b.updatedAt - a.updatedAt);
        setAllDrafts(drafts);
      } catch (error) {
        toast.error("Failed to load all drafts.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDrafts();
  }, [user, isOnline]);

  const handleViewDetails = async (draft: RDOFormData) => {
    if (!isOnline) {
      toast.error("You must be online to generate a PDF.");
      return;
    }
    setIsGeneratingPdf(draft.id);
    toast.info(`Generating PDF for ${draft.reportNumber}...`);
    try {
      const blob = await generatePdfBlob(draft);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // No need to revoke, as the new tab needs the object URL
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message}`);
      console.error(error);
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Viewing all drafts submitted by all users.</p>
        </div>
        <Button onClick={logout}>Logout</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All RDO Drafts</CardTitle>
          <CardDescription>
            This is a simulation. In a real application, this data would be fetched from a secure server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading all drafts...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Nº</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDrafts.length > 0 ? (
                  allDrafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell className="font-medium">{draft.reportNumber || 'N/A'}</TableCell>
                      <TableCell>{draft.customer || 'N/A'}</TableCell>
                      <TableCell>{draft.vessel || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{draft.userId}</TableCell>
                      <TableCell>{new Date(draft.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(draft)}
                          disabled={isGeneratingPdf === draft.id}
                        >
                          {isGeneratingPdf === draft.id ? 'Generating...' : 'View Details'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No drafts found across all users.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
