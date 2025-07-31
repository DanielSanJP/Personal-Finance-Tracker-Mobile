import React from "react";
import { ScrollView, View, Text } from "react-native";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui";

export default function ComponentShowcase() {
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [isChecked, setIsChecked] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <ScrollView className="flex-1 bg-background p-4">
        <View className="space-y-6">
          <Text className="text-2xl font-bold text-foreground mb-4">
            shadcn/ui Components for Expo
          </Text>

          {/* Alert */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Alert
            </Text>
            <Alert>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                All components have been successfully migrated to Expo.
              </AlertDescription>
            </Alert>
          </View>

          {/* Breadcrumb */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Breadcrumb
            </Text>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onPress={() => console.log("Home")}>
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onPress={() => console.log("Components")}>
                    Components
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Showcase</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </View>

          {/* Buttons */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Buttons
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </View>
          </View>

          {/* Badge */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Badges
            </Text>
            <View className="flex flex-row flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </View>
          </View>

          {/* Card */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Card
            </Text>
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>
                  This is a description of the card content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Text className="text-foreground">
                  Card content goes here. This is a basic card component.
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Input and Label */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Input & Label
            </Text>
            <View className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter your email"
                value=""
                onChangeText={() => {}}
              />
            </View>
          </View>

          {/* Checkbox */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Checkbox
            </Text>
            <View className="flex flex-row items-center space-x-2">
              <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
              <Label>Accept terms and conditions</Label>
            </View>
          </View>

          {/* Select */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Select
            </Text>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </View>

          {/* Date Picker */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Date Picker
            </Text>
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Pick a date"
            />
          </View>

          {/* Progress */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Progress
            </Text>
            <Progress value={65} className="w-full" />
          </View>

          {/* Separator */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Separator
            </Text>
            <Separator />
          </View>

          {/* Tabs */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Tabs
            </Text>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1">
                <Text className="text-foreground">Content for Tab 1</Text>
              </TabsContent>
              <TabsContent value="tab2">
                <Text className="text-foreground">Content for Tab 2</Text>
              </TabsContent>
              <TabsContent value="tab3">
                <Text className="text-foreground">Content for Tab 3</Text>
              </TabsContent>
            </Tabs>
          </View>

          {/* Table */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Table
            </Text>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>Admin</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </View>

          {/* Dialog */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Dialog
            </Text>
            <Button onPress={() => setDialogOpen(true)}>Open Dialog</Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent onClose={() => setDialogOpen(false)}>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog description. You can put any content here.
                  </DialogDescription>
                </DialogHeader>
                <Text className="text-foreground">
                  Dialog content goes here.
                </Text>
              </DialogContent>
            </Dialog>
          </View>

          {/* Tooltip */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Tooltip
            </Text>
            <Tooltip>
              <TooltipTrigger>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>This is a tooltip</TooltipContent>
            </Tooltip>
          </View>

          {/* Calendar */}
          <View>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Calendar
            </Text>
            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              mode="single"
            />
          </View>
        </View>
      </ScrollView>
    </TooltipProvider>
  );
}
