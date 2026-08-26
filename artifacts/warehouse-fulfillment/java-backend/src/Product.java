public class Product {
    private int productId;
    private String productName;
    private String category;
    private int quantity;
    private String storageLocation;
    private String status;

    public Product(int productId, String productName, String category, int quantity,
                   String storageLocation, String status) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.quantity = quantity;
        this.storageLocation = storageLocation;
        this.status = status;
    }

    public int getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getCategory() {
        return category;
    }

    public int getQuantity() {
        return quantity;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public String getStatus() {
        return status;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return productId + " | " + productName + " | " + category + " | "
                + quantity + " units | " + storageLocation + " | " + status;
    }
}