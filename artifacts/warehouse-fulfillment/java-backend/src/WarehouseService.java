import java.util.ArrayList;
import java.util.List;

public class WarehouseService {
    private final ArrayList<Product> products = new ArrayList<>();
    private final ArrayList<Storage> storageLocations = new ArrayList<>();

    // Product CRUD
    public void addProduct(Product product) {
        products.add(product);
    }

    public ArrayList<Product> getProducts() {
        return products;
    }

    public Product searchProduct(int productId) {
        for (Product product : products) {
            if (product.getProductId() == productId) {
                return product;
            }
        }
        return null;
    }

    public List<Product> searchProduct(String searchText) {
        ArrayList<Product> matches = new ArrayList<>();
        String query = searchText.toLowerCase();

        for (Product product : products) {
            if (String.valueOf(product.getProductId()).contains(query)
                    || product.getProductName().toLowerCase().contains(query)
                    || product.getCategory().toLowerCase().contains(query)) {
                matches.add(product);
            }
        }
        return matches;
    }

    public boolean updateProduct(int productId, String productName, String category,
                                 int quantity, String storageLocation, String status) {
        Product product = searchProduct(productId);
        if (product == null) {
            return false;
        }

        product.setProductName(productName);
        product.setCategory(category);
        product.setQuantity(quantity);
        product.setStorageLocation(storageLocation);
        product.setStatus(status);
        return true;
    }

    public boolean deleteProduct(int productId) {
        Product product = searchProduct(productId);
        return product != null && products.remove(product);
    }

    // Storage CRUD
    public void addStorage(Storage storage) {
        storageLocations.add(storage);
    }

    public ArrayList<Storage> getStorageLocations() {
        return storageLocations;
    }

    public Storage searchStorage(int storageId) {
        for (Storage storage : storageLocations) {
            if (storage.getStorageId() == storageId) {
                return storage;
            }
        }
        return null;
    }

    public boolean updateStorage(int storageId, String location, int capacity,
                                 int occupiedSpace, String status) {
        Storage storage = searchStorage(storageId);
        if (storage == null) {
            return false;
        }

        storage.setLocation(location);
        storage.setCapacity(capacity);
        storage.setOccupiedSpace(occupiedSpace);
        storage.setStatus(status);
        return true;
    }

    public boolean deleteStorage(int storageId) {
        Storage storage = searchStorage(storageId);
        return storage != null && storageLocations.remove(storage);
    }
}