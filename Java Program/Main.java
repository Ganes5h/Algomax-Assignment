class Node {
    int key, height;
    Node left, right;
 
    Node(int key) {
        this.key = key;
        height = 1;
    }
}
 
class BalancedBinaryTree {
 
    private int height(Node node) {
        return node == null ? 0 : node.height;
    }
 
    private int getBalance(Node node) {
        return node == null ? 0 : height(node.left) - height(node.right);
    }
 
    private Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;
 
        x.right = y;
        y.left = T2;
 
        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;
 
        return x;
    }
 
    private Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;
 
        y.left = x;
        x.right = T2;
 
        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;
 
        return y;
    }
 
    public Node insert(Node node, int key) {
        if (node == null) {
            return new Node(key);
        }
 
        if (key < node.key) {
            node.left = insert(node.left, key);
        } else if (key > node.key) {
            node.right = insert(node.right, key);
        } else {
            return node; // Duplicates are not allowed
        }
 
        node.height = Math.max(height(node.left), height(node.right)) + 1;
 
        int balance = getBalance(node);
 
        if (balance > 1 && key < node.left.key) {
            return rightRotate(node);
        }
 
        if (balance < -1 && key > node.right.key) {
            return leftRotate(node);
        }
 
        if (balance > 1 && key > node.left.key) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }
 
        if (balance < -1 && key < node.right.key) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }
 
        return node;
    }
 
    public Node delete(Node root, int key) {
        if (root == null) {
            return root;
        }
 
        if (key < root.key) {
            root.left = delete(root.left, key);
        } else if (key > root.key) {
            root.right = delete(root.right, key);
        } else {
            if ((root.left == null) || (root.right == null)) {
                Node temp = (root.left != null) ? root.left : root.right;
 
                if (temp == null) {
                    root = null;
                } else {
                    root = temp;
                }
            } else {
                Node temp = getMinValueNode(root.right);
                root.key = temp.key;
                root.right = delete(root.right, temp.key);
            }
        }
 
        if (root == null) {
            return root;
        }
 
        root.height = Math.max(height(root.left), height(root.right)) + 1;
 
        int balance = getBalance(root);
 
        if (balance > 1 && getBalance(root.left) >= 0) {
            return rightRotate(root);
        }
 
        if (balance > 1 && getBalance(root.left) < 0) {
            root.left = leftRotate(root.left);
            return rightRotate(root);
        }
 
        if (balance < -1 && getBalance(root.right) <= 0) {
            return leftRotate(root);
        }
 
        if (balance < -1 && getBalance(root.right) > 0) {
            root.right = rightRotate(root.right);
            return leftRotate(root);
        }
 
        return root;
    }
 
    private Node getMinValueNode(Node node) {
        Node current = node;
        while (current.left != null) {
            current = current.left;
        }
        return current;
    }
 
    public void preOrder(Node node) {
        if (node != null) {
            System.out.print(node.key + " ");
            preOrder(node.left);
            preOrder(node.right);
        }
    }
 
    public static void main(String[] args) {
        BalancedBinaryTree tree = new BalancedBinaryTree();
        Node root = null;
 
        int[] keys = {10, 20, 30, 40, 50, 25};
 
        for (int key : keys) {
            root = tree.insert(root, key);
        }
 
        System.out.println("Preorder traversal of the tree:");
        tree.preOrder(root);
        System.out.println();
 
        root = tree.delete(root, 50);
 
        System.out.println("Preorder traversal after deletion of 50:");
        tree.preOrder(root);
    }
}