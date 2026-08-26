public class Main {
    public static void main(String[] args) {
        WarehouseService warehouseService = new WarehouseService();

        warehouseService.addProduct(new Product(
                1001, "Packing Tape", "Packaging", 120, "A-01", "In Stock"));
        warehouseService.addProduct(new Product(
                1002, "Small Carton Box", "Packaging", 18, "A-02", "Low Stock"));
        warehouseService.addStorage(new Storage(
                1, "A-01", 500, 312, "Available"));

        System.out.println("Warehouse Fulfilment Storage Management System");
        System.out.println("\nProducts:");
        for (Product product : warehouseService.getProducts()) {
            System.out.println(product);
        }

        System.out.println("\nStorage locations:");
        for (Storage storage : warehouseService.getStorageLocations()) {
            System.out.println(storage);
        }
    }
}