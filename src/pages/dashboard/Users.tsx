import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
  },
];

const DashboardUsers = () => (
  <div className="space-y-6">
    <div>
      <h1 className="heading-section">Users</h1>
      <p className="text-secondary">Manage users and permissions</p>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === "Active" ? "default" : "secondary"}
                  >
                    {u.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default DashboardUsers;
