import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  CircleDollarSign, 
  DollarSign, 
  Search, 
  User, 
  UserCheck, 
  UserPlus, 
  Users, 
  Settings,
  RefreshCcw
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "wouter";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditCurrency, setCreditCurrency] = useState("USD");
  
  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", searchQuery],
    queryFn: async () => {
      try {
        const url = searchQuery 
          ? `/api/admin/users?search=${encodeURIComponent(searchQuery)}`
          : "/api/admin/users";
        const res = await apiRequest("GET", url);
        return res.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, data: [] };
      }
    },
  });
  
  // Credit balance mutation
  const creditMutation = useMutation({
    mutationFn: async (data: { userId: number, currencyId: number, amount: number }) => {
      const res = await apiRequest("POST", "/api/admin/credit-balance", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Balance credited successfully",
        });
        
        // Clear the form
        setCreditAmount("");
        
        // Refetch user data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to credit balance",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Handle credit balance
  const handleCreditBalance = () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      });
      return;
    }
    
    if (!creditAmount || isNaN(parseFloat(creditAmount)) || parseFloat(creditAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    // Get currency ID (simplified for now)
    const currencyId = 1; // USD is typically ID 1
    
    creditMutation.mutate({
      userId: selectedUser.id,
      currencyId,
      amount: parseFloat(creditAmount),
    });
  };
  
  const users = usersData?.data || [];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 w-full bg-gray-900 text-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-6 w-6" />
              <span className="text-lg font-bold">Admin Panel</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">Dashboard</Link>
            <Link href="/admin/users" className="text-sm font-medium text-white">Users</Link>
            <Link href="/admin/staking" className="text-sm font-medium text-gray-300 hover:text-white">Staking Rates</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container flex-1 py-8 px-4 md:px-6">
        <div className="grid gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
              <p className="text-gray-500">
                View and manage user accounts
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
                }}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Users table */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage registered user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-200 rounded-full p-1">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <span>
                              {user.firstName} {user.lastName}
                            </span>
                            {user.isAdmin && (
                              <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded">
                                Admin
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <span className="flex items-center text-green-600">
                              <UserCheck className="h-4 w-4 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-amber-600">Not Verified</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Credit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Credit User Balance</DialogTitle>
                                <DialogDescription>
                                  Add funds to {selectedUser?.firstName} {selectedUser?.lastName}'s account
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="currency">Currency</Label>
                                  <select
                                    id="currency"
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    value={creditCurrency}
                                    onChange={(e) => setCreditCurrency(e.target.value)}
                                  >
                                    <option value="USD">USD</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="amount">Amount</Label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                      id="amount"
                                      type="number"
                                      placeholder="0.00"
                                      className="pl-10"
                                      min="0"
                                      step="0.01"
                                      value={creditAmount}
                                      onChange={(e) => setCreditAmount(e.target.value)}
                                    />
                                  </div>
                                </div>
                                
                                <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800">
                                  <p>
                                    <strong>Note:</strong> This will add funds to the user's account without recording a deposit transaction in their history.
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setCreditAmount("")}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleCreditBalance}
                                  disabled={
                                    !creditAmount || 
                                    isNaN(parseFloat(creditAmount)) || 
                                    parseFloat(creditAmount) <= 0 ||
                                    creditMutation.isPending
                                  }
                                >
                                  {creditMutation.isPending ? (
                                    <>
                                      <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>Credit Balance</>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-10 w-10 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Users Found</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    {searchQuery ? "No users match your search criteria" : "There are no users registered yet"}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}