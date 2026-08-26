public class Storage {
    private int storageId;
    private String location;
    private int capacity;
    private int occupiedSpace;
    private String status;

    public Storage(int storageId, String location, int capacity, int occupiedSpace,
                   String status) {
        this.storageId = storageId;
        this.location = location;
        this.capacity = capacity;
        this.occupiedSpace = occupiedSpace;
        this.status = status;
    }

    public int getStorageId() {
        return storageId;
    }

    public String getLocation() {
        return location;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getOccupiedSpace() {
        return occupiedSpace;
    }

    public int getAvailableSpace() {
        return capacity - occupiedSpace;
    }

    public String getStatus() {
        return status;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public void setOccupiedSpace(int occupiedSpace) {
        this.occupiedSpace = occupiedSpace;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return storageId + " | " + location + " | " + occupiedSpace + "/"
                + capacity + " units | " + getAvailableSpace() + " available | " + status;
    }
}