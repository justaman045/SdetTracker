export const INTERVIEW_QUESTIONS = [
  // Java Core (8 questions)
  {
    id: 'java-overloading-vs-overriding',
    category: 'Java Core',
    difficulty: 'Easy',
    question: 'What is the difference between method overloading and method overriding?',
    answer: `**Method Overloading** (Compile-time Polymorphism):
- Same class, same method name, different parameters (type, number, or order)
- Resolved at compile time by the compiler
- Return type alone cannot differentiate overloaded methods
- Example: \`print(int)\`, \`print(String)\`, \`print(int, String)\`

**Method Overriding** (Runtime Polymorphism):
- Subclass provides specific implementation of a method defined in the parent class
- Resolved at runtime based on the actual object type
- Uses \`@Override\` annotation (best practice)
- Method signature must be identical; return type can be covariant
- Cannot override \`static\`, \`final\`, or \`private\` methods

**Key Interview Point**: Overloading is "same name, different params" — the compiler picks which one. Overriding is "child replaces parent" — the JVM picks at runtime.

**SDET Example**: You might overload a \`waitForElement(By)\` and \`waitForElement(By, int timeout)\`. You override \`onTestFailure()\` in your custom listener to add screenshot capture.`,
  },
  {
    id: 'java-string-immutability',
    category: 'Java Core',
    difficulty: 'Medium',
    question: 'Why is String immutable in Java? What happens when you use == vs .equals() on Strings?',
    answer: `**Why String is Immutable:**
- String Pool optimization — JVM reuses String literals to save memory. If Strings were mutable, changing one reference would corrupt all others pointing to the same pool object
- Thread safety — immutable objects are inherently thread-safe without synchronization
- Security — used as HashMap keys, method parameters, class loading. Mutation would be a security risk
- Hashcode caching — String caches its hashcode; mutability would invalidate this

**How it works:**
\`\`\`java
String a = "hello";  // goes to String Pool
String b = "hello";  // reuses same pool object
String c = new String("hello");  // new object on heap
\`\`\`

**== vs .equals():**
- \`==\` compares reference (memory address)
- \`.equals()\` compares content (character sequence)

\`\`\`java
a == b        // true — same pool object
a == c        // false — different heap objects
a.equals(c)   // true — same content
\`\`\`

**SDET Context**: Always use \`.equals()\` when asserting text on web pages. \`assertEquals(expected, element.getText())\` uses \`.equals()\` internally — never use \`==\`.`,
  },
  {
    id: 'java-collections-hashmap',
    category: 'Java Core',
    difficulty: 'Medium',
    question: 'How does HashMap work internally in Java? What happens when two keys have the same hashcode?',
    answer: `**HashMap Internals:**
HashMap uses an array of "buckets" (Node[] table). Each bucket is a linked list (Java 8+ converts to tree when list > 8 items).

**Put operation:**
1. Compute key.hashCode()
2. Hash it further: \`(h = key.hashCode()) ^ (h >>> 16)\`
3. Index = hash & (capacity - 1)
4. Place Node{key, value, hash, next} at that bucket

**Get operation:**
1. Compute hash → find bucket index
2. Traverse the list at that bucket
3. Find entry where \`key.equals(storedKey)\`

**Hash Collision:**
When two different keys produce the same bucket index (collision):
- **Chaining**: Java uses linked list / tree at the same bucket
- Both entries live in the bucket, distinguished by \`equals()\`
- Performance degrades from O(1) to O(n) with many collisions
- Java 8+: converts to Red-Black Tree at 8 entries → O(log n)

**Key interview points:**
- Default capacity: 16, load factor: 0.75 (rehashes at 12 entries)
- Allows one null key (stored at bucket 0)
- Not thread-safe — use ConcurrentHashMap for concurrency

**SDET Use**: HashMap for test data maps, response body parsing, storing config key-value pairs.`,
  },
  {
    id: 'java-threadlocal',
    category: 'Java Core',
    difficulty: 'Hard',
    question: 'What is ThreadLocal and why is it critical for parallel Selenium test execution?',
    answer: `**ThreadLocal Concept:**
ThreadLocal provides each thread with its own isolated copy of a variable. When thread A reads \`threadLocal.get()\`, it gets A's copy. Thread B gets B's copy. No sharing, no synchronization needed.

**Without ThreadLocal (broken parallel tests):**
\`\`\`java
public class DriverManager {
    private static WebDriver driver; // SHARED — all threads use same driver!
}
// Thread 1 and Thread 2 both interact with the same browser → chaos
\`\`\`

**With ThreadLocal (correct):**
\`\`\`java
public class DriverManager {
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    public static void setDriver(WebDriver d) { driver.set(d); }
    public static WebDriver getDriver() { return driver.get(); }
    public static void removeDriver() {
        driver.get().quit();
        driver.remove(); // CRITICAL — prevents memory leaks
    }
}
\`\`\`

**Why remove() matters:**
In thread pools (like TestNG's parallel executor), threads are reused. If you don't call \`remove()\`, the old WebDriver remains in the thread's slot and will be returned to the next test that runs on that thread — wrong driver, crashed tests.

**Pattern in BaseTest:**
\`\`\`java
@AfterMethod
public void teardown() {
    DriverManager.removeDriver(); // always in @AfterMethod
}
\`\`\`

**SDET Interview Point**: "Our parallel test suite ran on ThreadLocal DriverManager. Every @AfterMethod called remove() to prevent leaks."`,
  },
  {
    id: 'java-checked-vs-unchecked',
    category: 'Java Core',
    difficulty: 'Easy',
    question: 'What is the difference between checked and unchecked exceptions? Give SDET-relevant examples.',
    answer: `**Checked Exceptions:**
- Subclass of \`Exception\` (not RuntimeException)
- Compiler FORCES you to handle them (try-catch or throws declaration)
- Represent recoverable conditions the caller should handle
- Examples: \`IOException\`, \`SQLException\`, \`FileNotFoundException\`, \`ClassNotFoundException\`

**Unchecked Exceptions:**
- Subclass of \`RuntimeException\`
- Compiler does NOT require handling — they're programmer errors
- Represent bugs or unexpected conditions
- Examples: \`NullPointerException\`, \`ArrayIndexOutOfBoundsException\`, \`StaleElementReferenceException\`, \`NoSuchElementException\`

**SDET-Specific Examples:**
- \`StaleElementReferenceException\` (unchecked) — element reference became invalid after DOM change
- \`NoSuchElementException\` (unchecked) — locator didn't find the element
- \`IOException\` (checked) — reading test data from file
- \`SQLException\` (checked) — JDBC database query

**Custom Exception Pattern:**
\`\`\`java
// Unchecked — caller doesn't need to catch it
public class ElementNotInteractableException extends RuntimeException {
    public ElementNotInteractableException(String message, Throwable cause) {
        super("Element not interactable: " + message, cause);
    }
}
\`\`\`

**Interview tip**: "I extend RuntimeException for custom automation exceptions so callers don't have to pepper their code with try-catch."`,
  },
  {
    id: 'java-streams',
    category: 'Java Core',
    difficulty: 'Medium',
    question: 'How do you use Java Stream API in test automation? Give practical examples.',
    answer: `**Stream API Basics:**
Streams provide a functional way to process collections: filter → map → collect in a single pipeline.

**SDET Practical Examples:**

**1. Filter test data:**
\`\`\`java
List<User> adminUsers = allUsers.stream()
    .filter(u -> u.getRole().equals("ADMIN"))
    .collect(Collectors.toList());
\`\`\`

**2. Extract all text from WebElements:**
\`\`\`java
List<String> productNames = driver.findElements(By.css(".product-name"))
    .stream()
    .map(WebElement::getText)
    .collect(Collectors.toList());
\`\`\`

**3. Check if all items are displayed:**
\`\`\`java
boolean allVisible = elements.stream()
    .allMatch(WebElement::isDisplayed);
assertTrue(allVisible, "Not all items are visible");
\`\`\`

**4. Find first error message:**
\`\`\`java
Optional<String> error = validationMessages.stream()
    .map(WebElement::getText)
    .filter(t -> t.contains("required"))
    .findFirst();
error.ifPresent(msg -> fail("Unexpected error: " + msg));
\`\`\`

**5. Group API response items by category:**
\`\`\`java
Map<String, List<Product>> byCategory = products.stream()
    .collect(Collectors.groupingBy(Product::getCategory));
\`\`\`

**Key Stream operations:**
- \`filter(Predicate)\` — keeps matching elements
- \`map(Function)\` — transforms each element
- \`collect(Collector)\` — terminal, produces result
- \`findFirst()\` → Optional
- \`anyMatch / allMatch / noneMatch\` → boolean`,
  },
  {
    id: 'java-interface-vs-abstract',
    category: 'Java Core',
    difficulty: 'Easy',
    question: 'Interface vs Abstract class — when would you use each in an automation framework?',
    answer: `**Abstract Class:**
- Can have both abstract and concrete methods
- Can have instance variables / constructors
- Single inheritance only (a class can extend one abstract class)
- Use when you want to share code among closely related classes

**Interface:**
- All methods are abstract by default (Java 8+ allows default/static methods)
- No instance variables (only constants)
- A class can implement multiple interfaces
- Use when you want to define a contract that unrelated classes can fulfill

**Automation Framework Examples:**

**Abstract Class — BasePage:**
\`\`\`java
public abstract class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }

    // Shared utility — no need to rewrite in every page
    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }
}
// LoginPage extends BasePage — gets driver, wait, waitForVisible for free
\`\`\`

**Interface — defining contracts:**
\`\`\`java
public interface DriverManager {
    WebDriver initDriver(String browser);
    void quitDriver();
}
// ChromeDriverManager implements DriverManager
// FirefoxDriverManager implements DriverManager
\`\`\`

**Rule of thumb**: "Can I say X IS-A Y?" → abstract class. "Does X behave like Y?" → interface.`,
  },
  {
    id: 'java-generics',
    category: 'Java Core',
    difficulty: 'Medium',
    question: 'What are generics in Java and how do you use them in automation utilities?',
    answer: `**What Generics Do:**
Generics allow classes and methods to operate on typed parameters, providing compile-time type safety without casting.

**Without generics (fragile):**
\`\`\`java
List list = new ArrayList();
list.add("hello");
String s = (String) list.get(0); // runtime ClassCastException risk
\`\`\`

**With generics (safe):**
\`\`\`java
List<String> list = new ArrayList<>();
list.add("hello");
String s = list.get(0); // no cast needed, compile-time safe
\`\`\`

**SDET Utility Examples:**

**Generic retry method:**
\`\`\`java
public <T> T retry(Supplier<T> action, int maxAttempts) {
    for (int i = 0; i < maxAttempts; i++) {
        try {
            return action.get();
        } catch (StaleElementReferenceException e) {
            if (i == maxAttempts - 1) throw e;
        }
    }
    return null;
}
// Usage: WebElement el = retry(() -> driver.findElement(By.id("btn")), 3);
\`\`\`

**Generic data provider parser:**
\`\`\`java
public <T> List<T> parseJson(String filePath, Class<T> clazz) throws IOException {
    ObjectMapper mapper = new ObjectMapper();
    return mapper.readValue(new File(filePath),
        mapper.getTypeFactory().constructCollectionType(List.class, clazz));
}
// Usage: List<UserData> users = parseJson("users.json", UserData.class);
\`\`\`

**Common generic interfaces in automation:**
- \`Supplier<T>\` — factory methods
- \`Function<T, R>\` — transforms T to R
- \`Predicate<T>\` — boolean test on T`,
  },

  // Selenium (5 questions)
  {
    id: 'selenium-explicit-vs-implicit',
    category: 'Selenium',
    difficulty: 'Easy',
    question: 'Explain the difference between implicit wait, explicit wait, and fluent wait. Which should you use and why?',
    answer: `**Implicit Wait:**
- Set once, applies globally to ALL findElement calls
- WebDriver polls for the element until timeout
- \`driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));\`
- Problem: blunt instrument — waits even when not needed, can't wait for specific conditions

**Explicit Wait:**
- Targeted wait for a specific element and specific condition
- \`WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));\`
- \`wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));\`
- Best practice — precise, per-element control

**Fluent Wait:**
- Custom polling interval + ignore specific exceptions
\`\`\`java
Wait<WebDriver> wait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(30))
    .pollingEvery(Duration.ofSeconds(2))
    .ignoring(NoSuchElementException.class);
wait.until(d -> d.findElement(By.id("result")).isDisplayed());
\`\`\`
- Use for slow-loading async content or third-party elements

**Why NOT to mix implicit + explicit:**
Combining them causes unpredictable timeouts — WebDriver waits for both, sometimes doubling your wait time.

**Recommendation:**
- Set implicit wait to 0 (disabled)
- Use explicit wait for all element interactions
- Use fluent wait only for polling scenarios with custom logic

**SDET talking point**: "We disabled implicit wait globally and used WebDriverWait with ExpectedConditions everywhere. It made our suite 40% faster than the previous team's approach."`,
  },
  {
    id: 'selenium-stale-element',
    category: 'Selenium',
    difficulty: 'Hard',
    question: 'What causes StaleElementReferenceException and how do you handle it?',
    answer: `**What causes it:**
StaleElementReferenceException occurs when you hold a reference to a WebElement, but the DOM has changed since you located it — the element no longer exists at the reference you hold.

**Common causes:**
1. Page navigation or partial page reload after locating element
2. JavaScript re-renders the DOM (React, Angular apps)
3. Page refresh
4. AJAX updates that replace DOM nodes
5. Switching frames and back

**Detection Pattern:**
\`\`\`java
// Element found, then page partially reloads
WebElement btn = driver.findElement(By.id("submit")); // Reference captured
// ... some action that triggers AJAX ...
btn.click(); // StaleElementReferenceException!
\`\`\`

**Solution 1 — Re-locate on each use:**
Don't store elements as instance variables if the DOM refreshes. Re-find them in the method:
\`\`\`java
public void clickSubmit() {
    driver.findElement(By.id("submit")).click(); // re-locate each time
}
\`\`\`

**Solution 2 — Retry wrapper:**
\`\`\`java
public void safeClick(By locator) {
    int attempts = 0;
    while (attempts < 3) {
        try {
            driver.findElement(locator).click();
            return;
        } catch (StaleElementReferenceException e) {
            attempts++;
        }
    }
}
\`\`\`

**Solution 3 — Fluent Wait ignoring Stale:**
\`\`\`java
Wait<WebDriver> wait = new FluentWait<>(driver)
    .withTimeout(Duration.ofSeconds(10))
    .pollingEvery(Duration.ofMillis(500))
    .ignoring(StaleElementReferenceException.class);
wait.until(ExpectedConditions.elementToBeClickable(By.id("btn"))).click();
\`\`\`

**Prevention**: In Page Objects, use By locators as fields rather than WebElement fields. Re-locate in each method.`,
  },
  {
    id: 'selenium-pom',
    category: 'Selenium',
    difficulty: 'Medium',
    question: 'Explain Page Object Model design pattern. How do you structure a BasePage and a LoginPage?',
    answer: `**Page Object Model (POM):**
POM creates a class for each web page/component. The class holds locators and methods representing user actions. Tests never interact with the DOM directly — they call page methods.

**Benefits:**
- Locator changes happen in one place
- Tests read like user stories
- Reusability across test cases
- Separation of test logic from UI interaction

**BasePage:**
\`\`\`java
public abstract class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    protected void click(WebElement element) {
        wait.until(ExpectedConditions.elementToBeClickable(element)).click();
    }

    protected void type(WebElement element, String text) {
        click(element);
        element.clear();
        element.sendKeys(text);
    }

    protected String getText(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element)).getText();
    }
}
\`\`\`

**LoginPage:**
\`\`\`java
public class LoginPage extends BasePage {
    @FindBy(id = "username") private WebElement usernameField;
    @FindBy(id = "password") private WebElement passwordField;
    @FindBy(css = "button[type='submit']") private WebElement loginButton;
    @FindBy(css = ".error-message") private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public HomePage loginAs(String username, String password) {
        type(usernameField, username);
        type(passwordField, password);
        click(loginButton);
        return new HomePage(driver); // returns next page
    }

    public String getErrorMessage() {
        return getText(errorMessage);
    }
}
\`\`\`

**Test:**
\`\`\`java
HomePage home = new LoginPage(driver).loginAs("admin@test.com", "secret");
assertTrue(home.isHeaderVisible());
\`\`\``,
  },
  {
    id: 'selenium-frame-window',
    category: 'Selenium',
    difficulty: 'Medium',
    question: 'How do you handle iframes and multiple browser windows/tabs in Selenium?',
    answer: `**Handling iFrames:**

An iframe is a separate HTML document embedded in the main page. Selenium cannot directly interact with elements inside an iframe without switching context first.

\`\`\`java
// Switch by name attribute
driver.switchTo().frame("frameName");

// Switch by index (0-based)
driver.switchTo().frame(0);

// Switch by WebElement reference
WebElement frame = driver.findElement(By.id("myFrame"));
driver.switchTo().frame(frame);

// Interact with element inside frame
driver.findElement(By.id("frameButton")).click();

// Return to main document
driver.switchTo().defaultContent();

// Return to parent frame only (nested frames)
driver.switchTo().parentFrame();
\`\`\`

**Nested iframes:**
\`\`\`java
driver.switchTo().frame("outer");
driver.switchTo().frame("inner"); // now inside outer > inner
// interact
driver.switchTo().defaultContent(); // back to main
\`\`\`

**Handling Multiple Windows/Tabs:**
\`\`\`java
String mainWindow = driver.getWindowHandle(); // current window handle

// Click something that opens a new tab
driver.findElement(By.id("openNewTab")).click();

// Wait for new window
Set<String> handles = driver.getWindowHandles();
for (String handle : handles) {
    if (!handle.equals(mainWindow)) {
        driver.switchTo().window(handle); // switch to new tab
        break;
    }
}
// Interact with new tab content
driver.findElement(By.id("newTabElement")).click();

// Return to main window
driver.switchTo().window(mainWindow);
\`\`\`

**Selenium 4 — Open new tab explicitly:**
\`\`\`java
driver.switchTo().newWindow(WindowType.TAB);
driver.get("https://example.com");
\`\`\``,
  },
  {
    id: 'selenium-testng-parallel',
    category: 'Selenium',
    difficulty: 'Hard',
    question: 'How do you configure TestNG for parallel execution? What are the common pitfalls?',
    answer: `**testng.xml Parallel Configuration:**
\`\`\`xml
<suite name="ParallelSuite" parallel="tests" thread-count="3">
    <test name="ChromeTests">
        <parameter name="browser" value="chrome"/>
        <classes>
            <class name="com.tests.LoginTest"/>
            <class name="com.tests.HomeTest"/>
        </classes>
    </test>
    <test name="FirefoxTests">
        <parameter name="browser" value="firefox"/>
        <classes>
            <class name="com.tests.LoginTest"/>
        </classes>
    </test>
</suite>
\`\`\`

**Parallel modes:**
- \`parallel="tests"\` — each \`<test>\` tag runs in its own thread
- \`parallel="classes"\` — each class runs in its own thread
- \`parallel="methods"\` — each @Test method runs in its own thread (most granular)

**Critical: ThreadLocal Driver Setup:**
\`\`\`java
public class DriverManager {
    private static final ThreadLocal<WebDriver> TL_DRIVER = new ThreadLocal<>();

    public static WebDriver getDriver() { return TL_DRIVER.get(); }
    public static void setDriver(WebDriver d) { TL_DRIVER.set(d); }
    public static void removeDriver() {
        TL_DRIVER.get().quit();
        TL_DRIVER.remove();
    }
}

public class BaseTest {
    @BeforeMethod
    @Parameters("browser")
    public void setup(@Optional("chrome") String browser) {
        DriverManager.setDriver(DriverFactory.createDriver(browser));
    }

    @AfterMethod
    public void teardown() {
        DriverManager.removeDriver(); // MUST call remove()
    }
}
\`\`\`

**Common Pitfalls:**
1. **Shared state**: Static fields that store non-ThreadLocal data break parallel runs
2. **Shared test data**: Multiple tests writing to the same DB row
3. **File path conflicts**: Writing screenshots to same filename
4. **Port conflicts**: Appium tests using same port
5. **Forgetting remove()**: ThreadLocal leaks cause wrong driver in next test

**ExtentReport in Parallel**: Use \`ExtentReports\` as singleton, but create \`ExtentTest\` per thread via ThreadLocal to avoid race conditions.`,
  },

  // API Testing (5 questions)
  {
    id: 'api-rest-assured-structure',
    category: 'API Testing',
    difficulty: 'Easy',
    question: 'Explain the given-when-then structure of REST Assured with a practical example.',
    answer: `**REST Assured Given-When-Then:**
Mirrors BDD syntax — each section has a clear responsibility.

- **given()** — request setup (base URL, headers, auth, body, params)
- **when()** — HTTP action (get, post, put, delete)
- **then()** — assertions (status code, body, headers)

**Full Example — POST Login:**
\`\`\`java
RestAssured.baseURI = "https://api.example.com";

Response response =
given()
    .contentType(ContentType.JSON)
    .header("X-API-Key", "secret-key")
    .body("{ \\"email\\": \\"test@test.com\\", \\"password\\": \\"pass123\\" }")
.when()
    .post("/auth/login")
.then()
    .statusCode(200)
    .contentType(ContentType.JSON)
    .body("user.email", equalTo("test@test.com"))
    .body("token", notNullValue())
    .body("user.role", equalTo("ADMIN"))
.extract()
    .response();

String token = response.jsonPath().getString("token");
\`\`\`

**Chaining — Use token in next request:**
\`\`\`java
given()
    .header("Authorization", "Bearer " + token)
.when()
    .get("/users/profile")
.then()
    .statusCode(200)
    .body("name", equalTo("Test User"));
\`\`\`

**RequestSpecBuilder for reuse:**
\`\`\`java
RequestSpecification authSpec = new RequestSpecBuilder()
    .setBaseUri("https://api.example.com")
    .addHeader("Authorization", "Bearer " + token)
    .setContentType(ContentType.JSON)
    .build();

given(authSpec).when().get("/orders").then().statusCode(200);
\`\`\`

**Common Hamcrest matchers:** \`equalTo\`, \`notNullValue\`, \`nullValue\`, \`hasSize\`, \`hasItem\`, \`contains\`, \`greaterThan\`, \`lessThan\``,
  },
  {
    id: 'api-status-codes',
    category: 'API Testing',
    difficulty: 'Easy',
    question: 'What HTTP status codes do you test for and what should an SDET validate about each?',
    answer: `**2xx — Success:**
- **200 OK** — GET/PUT success. Validate: response body, data accuracy, headers
- **201 Created** — POST created resource. Validate: Location header, new resource ID in body, resource actually exists (follow-up GET)
- **204 No Content** — DELETE/PUT with no body. Validate: body IS empty, resource deleted (follow-up GET returns 404)

**4xx — Client Errors (test these explicitly):**
- **400 Bad Request** — malformed request. Test: missing required fields, invalid data types, wrong format
- **401 Unauthorized** — no/invalid auth token. Test: no token, expired token, tampered token
- **403 Forbidden** — authenticated but no permission. Test: regular user accessing admin endpoint
- **404 Not Found** — resource doesn't exist. Test: deleted ID, invalid ID, typo in URL
- **422 Unprocessable Entity** — valid JSON but business rule violation. Test: duplicate email, invalid date range
- **429 Too Many Requests** — rate limiting. Test: rapid burst of requests

**5xx — Server Errors (should NOT appear in happy path):**
- **500 Internal Server Error** — unhandled exception. Investigate, not expected
- **502 Bad Gateway** — upstream service down. Infra issue
- **503 Service Unavailable** — overloaded. Load/stress testing

**SDET Validation Checklist per request:**
1. Status code is exactly what's expected
2. Content-Type header matches (JSON, XML)
3. Response time is within SLA (\`response.getTime() < 2000\`)
4. Body schema matches (correct fields, correct types)
5. Business logic (created order appears in order list)
6. Error messages are user-friendly (no stack traces in 4xx body)
7. No sensitive data in error responses`,
  },
  {
    id: 'api-authentication',
    category: 'API Testing',
    difficulty: 'Medium',
    question: 'How do you handle authentication in API testing? Explain Bearer token extraction and reuse.',
    answer: `**Authentication Types and REST Assured implementations:**

**Basic Auth:**
\`\`\`java
given()
    .auth().basic("username", "password")
.when()
    .get("/protected-resource");
\`\`\`

**Bearer Token (most common):**
\`\`\`java
// Step 1: Login to get token
String token = given()
    .contentType(ContentType.JSON)
    .body("{\\"username\\":\\"admin\\",\\"password\\":\\"pass\\"}")
.when()
    .post("/auth/login")
.then()
    .statusCode(200)
.extract()
    .path("token"); // or "data.accessToken" depending on response structure

// Step 2: Use token in subsequent requests
given()
    .header("Authorization", "Bearer " + token)
.when()
    .get("/admin/users")
.then()
    .statusCode(200);
\`\`\`

**OAuth2:**
\`\`\`java
given()
    .auth().oauth2(accessToken)
.when()
    .get("/api/resource");
\`\`\`

**Best Practice — Token Management Class:**
\`\`\`java
public class TokenManager {
    private static String token;
    private static long tokenExpiry;

    public static String getToken() {
        if (token == null || System.currentTimeMillis() > tokenExpiry) {
            token = fetchNewToken();
            tokenExpiry = System.currentTimeMillis() + (3600 * 1000); // 1 hour
        }
        return token;
    }

    private static String fetchNewToken() {
        return given()
            .contentType(ContentType.JSON)
            .body(getLoginPayload())
        .when()
            .post(LOGIN_URL)
        .then()
            .statusCode(200)
        .extract()
            .path("token");
    }
}
\`\`\`

**SDET Interview Point**: "We extracted the login call to a TestBase @BeforeSuite, stored the token in a shared variable, then injected it via RequestSpecBuilder so every test inherited auth without repeating login code."`,
  },
  {
    id: 'api-schema-validation',
    category: 'API Testing',
    difficulty: 'Medium',
    question: 'What is JSON schema validation and how do you implement it with REST Assured?',
    answer: `**Why Schema Validation?**
Schema validation checks the CONTRACT — structure, field names, data types, required fields — not just specific values. It catches API changes that break consumers even when values look fine.

**Creating a JSON Schema:**
Save as \`src/test/resources/schemas/user-schema.json\`:
\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "email", "role"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "role": { "type": "string", "enum": ["ADMIN", "USER", "VIEWER"] },
    "createdAt": { "type": "string", "format": "date-time" },
    "active": { "type": "boolean" }
  },
  "additionalProperties": false
}
\`\`\`

**REST Assured Schema Validation:**
\`\`\`java
// Add dependency: rest-assured-json-schema-validator
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

given()
    .header("Authorization", "Bearer " + token)
.when()
    .get("/users/123")
.then()
    .statusCode(200)
    .body(matchesJsonSchemaInClasspath("schemas/user-schema.json"));
\`\`\`

**What Schema Validation Catches:**
- New required field added without notice (backward-incompatible)
- Field type changed (number → string)
- Field renamed
- Enum value added/removed
- Nested object structure changed

**SDET Best Practice**: Run schema validation on every positive test case. Treat schema violations as P1 bugs — the API contract is broken.`,
  },
  {
    id: 'api-crud-chain',
    category: 'API Testing',
    difficulty: 'Medium',
    question: 'How do you structure a complete CRUD API test flow? Walk through Create-Read-Update-Delete.',
    answer: `**CRUD Test Flow Pattern:**
Each operation builds on the previous. The key is chaining — use data from earlier responses in later requests.

\`\`\`java
public class UserCRUDTest {
    private static String authToken;
    private static int createdUserId;

    @BeforeClass
    public static void setup() {
        authToken = TokenManager.getToken();
        RestAssured.baseURI = "https://api.example.com";
    }

    @Test(priority = 1)
    public void createUser() {
        String body = "{\\"name\\":\\"Test User\\",\\"email\\":\\"test" +
            System.currentTimeMillis() + "@test.com\\",\\"role\\":\\"USER\\"}";

        createdUserId = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/users")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Test User"))
        .extract()
            .path("id"); // capture for later tests
    }

    @Test(priority = 2, dependsOnMethods = "createUser")
    public void readUser() {
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/users/" + createdUserId)
        .then()
            .statusCode(200)
            .body("id", equalTo(createdUserId))
            .body("role", equalTo("USER"));
    }

    @Test(priority = 3, dependsOnMethods = "readUser")
    public void updateUser() {
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("{\\"name\\":\\"Updated Name\\"}")
        .when()
            .put("/users/" + createdUserId)
        .then()
            .statusCode(200)
            .body("name", equalTo("Updated Name"));
    }

    @Test(priority = 4, dependsOnMethods = "updateUser")
    public void deleteUser() {
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .delete("/users/" + createdUserId)
        .then()
            .statusCode(204);

        // Verify deleted
        given().header("Authorization", "Bearer " + authToken)
        .when().get("/users/" + createdUserId)
        .then().statusCode(404);
    }
}
\`\`\`

**Key Points**: Unique test data (timestamp), chained IDs, cleanup as final step, 404 verification after delete.`,
  },

  // Appium/Mobile (3 questions)
  {
    id: 'appium-architecture',
    category: 'Appium/Mobile',
    difficulty: 'Medium',
    question: 'Explain Appium architecture. How does a test command reach the device?',
    answer: `**Appium Architecture — 4 Layers:**

1. **Test Code (Your Framework)**
   - Java test using AppiumDriver API
   - Sends W3C WebDriver JSON commands via HTTP

2. **Appium Server (Node.js)**
   - Listens on port 4723 (default)
   - Routes commands to appropriate driver plugin
   - Manages sessions

3. **Platform Driver (UIAutomator2 / XCUITest)**
   - UIAutomator2: Android — translates commands to Android UI testing calls
   - XCUITest: iOS — translates commands to Apple's testing framework
   - Runs on-device or in emulator

4. **Device / Emulator**
   - Receives native automation calls
   - Returns results back up the chain

**Command Flow:**
\`\`\`
Test: driver.findElement(By.id("login_btn")).click()
  ↓
HTTP POST to Appium Server:
  {"using":"id","value":"login_btn"} → /session/{id}/element
  ↓
Appium routes to UIAutomator2 plugin
  ↓
UIAutomator2 server (APK installed on device) receives command
  ↓
Finds View with resource-id "login_btn"
  ↓
Performs tap at element coordinates
  ↓
Returns result → Appium → test
\`\`\`

**Appium 2.x Changes:**
- Drivers are separate plugins, not bundled: \`appium driver install uiautomator2\`
- UiAutomator2Options replaces DesiredCapabilities (deprecated)
- Commands: \`appium server\` instead of just \`appium\`

**Key Capabilities:**
\`\`\`java
UiAutomator2Options options = new UiAutomator2Options()
    .setPlatformName("Android")
    .setDeviceName("emulator-5554")
    .setAppPackage("com.myapp.android")
    .setAppActivity("com.myapp.MainActivity")
    .setAutomationName("UiAutomator2")
    .setNoReset(true); // don't reinstall app
\`\`\``,
  },
  {
    id: 'appium-locators',
    category: 'Appium/Mobile',
    difficulty: 'Medium',
    question: 'What are the different locator strategies in Appium for Android? Which is most reliable?',
    answer: `**Appium Android Locator Strategies (best to worst):**

**1. Accessibility ID (BEST — most stable)**
Maps to \`content-desc\` attribute set by developers for accessibility.
\`\`\`java
driver.findElement(AppiumBy.accessibilityId("login_button"));
\`\`\`
Ask devs to add content-desc to all testable elements. Language-independent. Won't break on UI changes.

**2. Resource ID (id)**
The \`resource-id\` attribute (e.g., \`com.myapp:id/login_btn\`).
\`\`\`java
driver.findElement(AppiumBy.id("com.myapp:id/login_btn"));
// or just
driver.findElement(By.id("login_btn")); // Appium handles the package prefix
\`\`\`
Very reliable when devs assign IDs consistently.

**3. UIAutomator2 Selector**
Most powerful — can scroll, use text matching, chain conditions:
\`\`\`java
// By text
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiSelector().text(\\"Login\\")"));

// By resource ID
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiSelector().resourceId(\\"com.myapp:id/submit\\")"));

// Scroll to element
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(" +
    "new UiSelector().text(\\"Privacy Policy\\"))"));
\`\`\`

**4. XPath (avoid if possible)**
Slow, fragile, breaks on any layout change. Use only as last resort:
\`\`\`java
driver.findElement(By.xpath("//android.widget.Button[@text='Login']"));
\`\`\`

**5. Class Name**
Too broad, usually returns multiple elements:
\`\`\`java
driver.findElements(By.className("android.widget.TextView"));
\`\`\`

**Appium Inspector**: Use it like browser DevTools to find element attributes. Shows all available locator strategies for each element.`,
  },
  {
    id: 'appium-gestures',
    category: 'Appium/Mobile',
    difficulty: 'Hard',
    question: 'How do you implement swipe and scroll gestures in Appium 2.x using W3C Actions?',
    answer: `**W3C Actions API (Appium 2.x recommended approach):**
DesiredCapabilities-style TouchAction/MultiTouchAction is deprecated. Use W3C PointerInput.

**Swipe (e.g., swipe left on a carousel):**
\`\`\`java
public void swipeLeft() {
    Dimension size = driver.manage().window().getSize();
    int startX = (int)(size.width * 0.8);
    int endX = (int)(size.width * 0.2);
    int y = size.height / 2;

    PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    Sequence swipe = new Sequence(finger, 1)
        .addAction(finger.createPointerMove(Duration.ZERO,
            PointerInput.Origin.viewport(), startX, y))
        .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
        .addAction(finger.createPointerMove(Duration.ofMillis(600),
            PointerInput.Origin.viewport(), endX, y))
        .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

    driver.perform(List.of(swipe));
}
\`\`\`

**Scroll Down (to load more content):**
\`\`\`java
public void scrollDown() {
    Dimension size = driver.manage().window().getSize();
    int startY = (int)(size.height * 0.7);
    int endY = (int)(size.height * 0.3);
    int x = size.width / 2;

    PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    Sequence scroll = new Sequence(finger, 1)
        .addAction(finger.createPointerMove(Duration.ZERO,
            PointerInput.Origin.viewport(), x, startY))
        .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
        .addAction(finger.createPointerMove(Duration.ofMillis(800),
            PointerInput.Origin.viewport(), x, endY))
        .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

    driver.perform(List.of(scroll));
}
\`\`\`

**Long Press:**
\`\`\`java
public void longPress(WebElement element) {
    Point location = element.getLocation();
    Dimension size = element.getSize();
    int x = location.getX() + size.getWidth() / 2;
    int y = location.getY() + size.getHeight() / 2;

    PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    Sequence longPress = new Sequence(finger, 0)
        .addAction(finger.createPointerMove(Duration.ZERO,
            PointerInput.Origin.viewport(), x, y))
        .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
        .addAction(new Pause(finger, Duration.ofSeconds(2)))  // hold
        .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));

    driver.perform(List.of(longPress));
}
\`\`\`

**UiScrollable (Android-specific, simpler):**
\`\`\`java
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiScrollable(new UiSelector().scrollable(true))" +
    ".scrollIntoView(new UiSelector().text(\\"Target Item\\"))"));
\`\`\``,
  },

  // Framework Architecture (4 questions)
  {
    id: 'framework-design',
    category: 'Framework Architecture',
    difficulty: 'Hard',
    question: 'How would you design a Selenium test automation framework from scratch for a mid-sized project?',
    answer: `**Framework Design — Clarify Requirements First:**
- Stack: Java + Maven + TestNG + Selenium 4
- Target: Web app (Chrome/Firefox/Edge)
- Scale: ~500 tests, 5 engineers, CI/CD with GitHub Actions

**Project Structure:**
\`\`\`
src/
  main/
    java/com/framework/
      core/         # DriverFactory, DriverManager (ThreadLocal)
      pages/        # BasePage, page classes
      api/          # RestAssured helpers, RequestSpecBuilder
      utils/        # WaitUtils, ScreenshotUtils, ExcelReader
      models/       # POJOs for API and test data
      config/       # ConfigReader (reads config.properties)
  test/
    java/com/tests/
      base/         # BaseTest (@BeforeMethod, @AfterMethod)
      login/        # LoginTests
      orders/       # OrderTests
    resources/
      config.properties   # base URLs, timeouts
      testng.xml          # test suites
      test-data/          # JSON/Excel files
      schemas/            # JSON schemas
\`\`\`

**Core Components:**
\`\`\`java
// 1. Config — single source of truth
public class Config {
    private static Properties props = loadProperties("config.properties");
    public static String get(String key) { return props.getProperty(key); }
    public static String getBaseUrl() { return System.getProperty("base.url", get("base.url")); }
}

// 2. ThreadLocal DriverManager
public class DriverManager {
    private static ThreadLocal<WebDriver> TL = new ThreadLocal<>();
    public static WebDriver getDriver() { return TL.get(); }
    public static void set(WebDriver d) { TL.set(d); }
    public static void quit() { TL.get().quit(); TL.remove(); }
}

// 3. DriverFactory
public class DriverFactory {
    public static WebDriver create(String browser) {
        return switch (browser.toLowerCase()) {
            case "firefox" -> createFirefox();
            case "edge" -> createEdge();
            default -> createChrome();
        };
    }
}

// 4. BaseTest
public class BaseTest {
    @BeforeMethod
    @Parameters({"browser"})
    public void setup(@Optional("chrome") String browser) {
        DriverManager.set(DriverFactory.create(browser));
    }
    @AfterMethod
    public void teardown(ITestResult result) {
        if (result.getStatus() == ITestResult.FAILURE) {
            ScreenshotUtils.captureAndAttach(DriverManager.getDriver(), result);
        }
        DriverManager.quit();
    }
}
\`\`\`

**Reporting**: Allure with @Step on page methods + @Attachment for screenshots.
**CI**: GitHub Actions on PR — headless, parallel, publish Allure report as artifact.`,
  },
  {
    id: 'framework-patterns',
    category: 'Framework Architecture',
    difficulty: 'Medium',
    question: 'Explain Singleton and Factory design patterns in the context of test automation.',
    answer: `**Singleton Pattern — DriverManager:**
Ensures only one instance of the manager exists. In parallel testing, ThreadLocal makes it thread-safe.

\`\`\`java
// Singleton — only one DriverManager instance
public class DriverManager {
    // Private static instance
    private static DriverManager instance;

    // ThreadLocal for thread safety
    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    // Private constructor — prevents external instantiation
    private DriverManager() {}

    // Lazy initialization
    public static synchronized DriverManager getInstance() {
        if (instance == null) {
            instance = new DriverManager();
        }
        return instance;
    }

    public WebDriver getDriver() { return driver.get(); }
    public void setDriver(WebDriver d) { driver.set(d); }
    public void removeDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }
}
\`\`\`

**Factory Pattern — DriverFactory:**
Creates objects without specifying the exact class. The factory decides which implementation to create based on input.

\`\`\`java
public class DriverFactory {
    public static WebDriver createDriver(String browserName) {
        ChromeOptions chromeOpts;
        FirefoxOptions ffOpts;

        return switch (browserName.toLowerCase()) {
            case "chrome" -> {
                chromeOpts = new ChromeOptions();
                chromeOpts.addArguments("--no-sandbox", "--disable-dev-shm-usage");
                if (Boolean.parseBoolean(Config.get("headless"))) {
                    chromeOpts.addArguments("--headless=new");
                }
                WebDriverManager.chromedriver().setup();
                yield new ChromeDriver(chromeOpts);
            }
            case "firefox" -> {
                ffOpts = new FirefoxOptions();
                WebDriverManager.firefoxdriver().setup();
                yield new FirefoxDriver(ffOpts);
            }
            case "remote" -> {
                chromeOpts = new ChromeOptions();
                yield new RemoteWebDriver(new URL(Config.get("grid.url")), chromeOpts);
            }
            default -> throw new IllegalArgumentException("Unsupported browser: " + browserName);
        };
    }
}
\`\`\`

**Why these patterns?**
- Singleton: prevents multiple instances creating multiple browser windows inadvertently
- Factory: adding a new browser (Safari, Edge) requires only one change — in the factory
- Tests don't care WHICH browser, they just call \`DriverFactory.createDriver(browser)\``,
  },
  {
    id: 'framework-data-driven',
    category: 'Framework Architecture',
    difficulty: 'Medium',
    question: 'How do you implement data-driven testing in TestNG? What are the different data sources?',
    answer: `**Data-Driven Testing — Core Concept:**
The same test logic runs with multiple input datasets. TestNG's @DataProvider is the mechanism.

**1. Inline DataProvider:**
\`\`\`java
@DataProvider(name = "loginData")
public Object[][] getLoginData() {
    return new Object[][] {
        {"valid@test.com", "correct_pass", true},
        {"invalid@test.com", "wrong_pass", false},
        {"", "some_pass", false},
    };
}

@Test(dataProvider = "loginData")
public void testLogin(String email, String password, boolean shouldSucceed) {
    boolean result = loginPage.loginAs(email, password).isLoginSuccessful();
    assertEquals(result, shouldSucceed);
}
\`\`\`

**2. Excel DataProvider (Apache POI):**
\`\`\`java
@DataProvider(name = "excelData")
public Object[][] getFromExcel() throws IOException {
    Workbook wb = WorkbookFactory.create(new File("src/test/resources/test-data/users.xlsx"));
    Sheet sheet = wb.getSheet("LoginData");
    int rows = sheet.getLastRowNum();
    Object[][] data = new Object[rows][3];
    for (int i = 1; i <= rows; i++) {  // start at 1 to skip header
        Row row = sheet.getRow(i);
        data[i-1][0] = row.getCell(0).getStringCellValue(); // email
        data[i-1][1] = row.getCell(1).getStringCellValue(); // password
        data[i-1][2] = row.getCell(2).getBooleanCellValue(); // expected
    }
    wb.close();
    return data;
}
\`\`\`

**3. JSON DataProvider:**
\`\`\`java
@DataProvider(name = "jsonData")
public Object[][] getFromJson() throws IOException {
    ObjectMapper mapper = new ObjectMapper();
    UserTestData[] testData = mapper.readValue(
        new File("test-data/users.json"), UserTestData[].class);
    return Arrays.stream(testData)
        .map(d -> new Object[]{d.email, d.password, d.expected})
        .toArray(Object[][]::new);
}
\`\`\`

**4. Parallel DataProvider:**
\`\`\`java
@DataProvider(name = "parallelData", parallel = true)  // runs each row in parallel
public Object[][] getParallelData() { ... }
\`\`\`

**Best Practice**: Keep test data separate from test code. Version control the test data files. Never hardcode credentials — use environment variables or encrypted vaults.`,
  },
  {
    id: 'framework-reporting',
    category: 'Framework Architecture',
    difficulty: 'Medium',
    question: 'How do you set up Allure reporting with TestNG? What do you attach to failure reports?',
    answer: `**Allure + TestNG Setup:**

**pom.xml dependencies:**
\`\`\`xml
<dependency>
    <groupId>io.qameta.allure</groupId>
    <artifactId>allure-testng</artifactId>
    <version>2.24.0</version>
</dependency>
<dependency>
    <groupId>io.qameta.allure</groupId>
    <artifactId>allure-java-commons</artifactId>
    <version>2.24.0</version>
</dependency>
\`\`\`

**Configure Allure listener in testng.xml:**
\`\`\`xml
<suite>
    <listeners>
        <listener class-name="io.qameta.allure.testng.AllureTestNg"/>
    </listeners>
</suite>
\`\`\`

**Annotate Page Methods with @Step:**
\`\`\`java
public class LoginPage extends BasePage {
    @Step("Enter email: {email}")
    public LoginPage enterEmail(String email) {
        type(emailField, email);
        return this;
    }

    @Step("Click Login button")
    public HomePage clickLogin() {
        click(loginButton);
        return new HomePage(driver);
    }
}
\`\`\`

**Custom Listener for screenshots on failure:**
\`\`\`java
public class AllureListener implements ITestListener {
    @Override
    public void onTestFailure(ITestResult result) {
        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            byte[] screenshot = ((TakesScreenshot) driver)
                .getScreenshotAs(OutputType.BYTES);
            Allure.addAttachment("Screenshot on Failure",
                "image/png", new ByteArrayInputStream(screenshot), "png");

            // Also attach page source
            Allure.addAttachment("Page Source", "text/html",
                driver.getPageSource());
        }
    }
}
\`\`\`

**Allure Annotations:**
\`\`\`java
@Test
@Description("Verify login with valid credentials")
@Severity(SeverityLevel.CRITICAL)
@Story("User Authentication")
@TmsLink("TC-101")
@Issue("BUG-456")
public void testValidLogin() { ... }
\`\`\`

**Generate Report:**
\`\`\`bash
mvn clean test
allure serve target/allure-results  # opens in browser
\`\`\``,
  },

  // System Design (3 questions)
  {
    id: 'sd-framework-design',
    category: 'System Design',
    difficulty: 'Hard',
    question: 'Design an automation framework for a microservices application with 20+ services. How do you handle test isolation, data management, and CI/CD?',
    answer: `**Requirements Clarification:**
- 20 microservices, REST APIs, 2 web frontends
- 10 SDET engineers
- CI/CD on GitHub Actions, deploy to K8s
- Goal: Fast feedback, stable tests, easy maintenance

**Framework Architecture:**

**Layer 1 — Shared Core Library (published as Maven artifact)**
\`\`\`
core-framework/
  ├── DriverManager + DriverFactory
  ├── RestAssuredClient with auth handling
  ├── TestBase + AllureListener
  ├── DataFactory (test data generators)
  └── ConfigManager (reads from env vars)
\`\`\`
Each service team depends on this. Versioned separately.

**Layer 2 — Service Test Modules**
\`\`\`
order-service-tests/  ←  depends on core v1.4
user-service-tests/   ←  depends on core v1.4
payment-tests/        ←  depends on core v1.4
e2e-tests/            ←  web UI tests, all services
\`\`\`

**Test Isolation Strategy:**
1. **API tests**: Each test creates its own data via the API at start, cleans up in @AfterMethod
2. **Database**: Tests run against a dedicated QA environment, not prod
3. **Kafka**: Unique consumer group IDs per test run to avoid consuming other tests' events
4. **Parallel safety**: No shared mutable state — ThreadLocal for WebDriver, per-test unique data

**Test Data Management:**
\`\`\`java
// Factory pattern — creates data, returns IDs for cleanup
public class UserDataFactory {
    public static CreatedUser createUser(String role) {
        // POST /users → returns user with ID
        // Returns CreatedUser record for test to use + cleanup
    }
}

// In test:
@Test
public void testOrderCreation() {
    CreatedUser user = UserDataFactory.createUser("BUYER");
    try {
        // test using user.getId()
    } finally {
        UserDataFactory.cleanup(user); // DELETE /users/{id}
    }
}
\`\`\`

**CI/CD Pipeline Design:**
\`\`\`yaml
on:
  push: [main]
  pull_request: [main]
  schedule: "0 2 * * *"  # nightly full run

jobs:
  smoke:       # 5 min — runs on every PR
    tests: @smoke tagged tests only

  regression:  # 30 min — runs on merge to main
    tests: full regression suite, parallel=4

  nightly:     # 2 hr — full E2E + cross-browser
    matrix: [chrome, firefox, edge]

  report:
    - Upload Allure results as artifact
    - Post summary to Slack
    - Gate: fail PR if smoke fails
\`\`\`

**Flaky Test Management**: Tests that fail >2 times in 10 runs are quarantined (moved to @flaky group), root cause required within 2 sprints before deletion.`,
  },
  {
    id: 'sd-test-pyramid',
    category: 'System Design',
    difficulty: 'Medium',
    question: 'Explain the Test Pyramid and how you apply it in an SDET role. What is the ice-cream cone antipattern?',
    answer: `**Test Pyramid:**
Mike Cohn's model — more tests at the bottom (fast, cheap), fewer at the top (slow, expensive).

\`\`\`
        /\\
       /E2E\\          10% — few, slow, fragile, expensive
      /------\\
     /  API   \\       30% — medium speed, catches integration issues
    /----------\\
   /   Unit     \\     60% — many, fast, cheap, reliable
  /______________\\
\`\`\`

**Unit Tests (base — 60%):**
- Test a single class/method in isolation
- Written by developers
- Run in milliseconds
- Catch logic errors immediately
- Mock all dependencies

**Integration/API Tests (middle — 30%):**
- Test service-to-service contracts
- Validate API contracts, DB interactions
- Run in seconds
- SDET's primary ownership
- Use real external services (or WireMock for third parties)

**E2E Tests (top — 10%):**
- Full user journeys through UI
- Only critical happy paths + top 3-5 negative paths
- Run in minutes
- Selenium/Playwright
- Most expensive to maintain

**Ice-Cream Cone Antipattern:**
\`\`\`
       /__________\\   Manual testing dominates
      /  Manual    \\
     /--------------\\
    /      E2E       \\   Heavy E2E automation
   /------------------\\
  /       API          \\  Little integration testing
 /----------------------\\
 Unit (tiny or missing)   Almost no unit tests
\`\`\`

**Why ice-cream cone is bad:**
- Manual tests are slow, not repeatable, not scalable
- E2E tests are brittle (DOM changes break locators) and slow
- No fast feedback loop — developers wait hours for test results
- High maintenance cost as UI changes frequently

**SDET's job**: Push the team toward the pyramid. Add API tests for every E2E test you remove. Influence developers to write unit tests. Reserve E2E for business-critical paths only.

**Real numbers from my experience**: Moved from 80% E2E to 50% API, 30% E2E, 20% unit. Suite runtime went from 4 hours to 45 minutes.`,
  },
  {
    id: 'sd-flaky-tests',
    category: 'System Design',
    difficulty: 'Hard',
    question: 'How do you detect, manage, and eliminate flaky tests in a large test suite?',
    answer: `**What Makes Tests Flaky:**
1. **Timing issues** — insufficient waits, race conditions
2. **Shared test data** — tests stepping on each other's data
3. **Environment issues** — network latency, external service availability
4. **Test order dependency** — test B assumes state left by test A
5. **Resource leaks** — browser not closed, DB connections not released
6. **Parallel execution** — non-thread-safe code

**Detection Strategy:**
\`\`\`yaml
# GitHub Actions — run flaky tests 10x to detect
- name: Flakiness Detection
  run: |
    for i in {1..10}; do
      mvn test -Dtest=@smoke -Dflaky.run=$i
    done
  continue-on-error: true
\`\`\`

Track: how many of 10 runs pass? < 9/10 = flaky.

**CI Tracking** — add labels in test report:
\`\`\`java
@Test
@Flaky(reason = "Timing issue with payment gateway", since = "2024-03-01")
public void testPaymentFlow() { ... }
\`\`\`

**Management Process:**
1. **Detect**: CI reports flag tests with <90% pass rate
2. **Quarantine**: Move to separate @flaky TestNG group immediately — don't block CI
3. **Assign**: SDET owner has 2 sprints to fix or delete
4. **Root cause**: Add logs, run 50x locally, check for timing/data/order issues
5. **Fix and graduate**: Return to main suite, monitor for 2 weeks

**Common Fixes:**
\`\`\`java
// FLAKY: Thread.sleep for DOM update
Thread.sleep(2000);
driver.findElement(By.id("result")).getText();

// FIXED: Wait for specific condition
wait.until(ExpectedConditions.textToBePresentInElementLocated(
    By.id("result"), "Expected text"));

// FLAKY: Static shared test data
private static String userId = "fixed-user-123";

// FIXED: Create per-test
private String userId;
@BeforeMethod
public void setup() { userId = UserFactory.create().getId(); }
@AfterMethod
public void cleanup() { UserFactory.delete(userId); }
\`\`\`

**SLA for flaky tests**: Zero flaky tests in main suite at any time. If CI is red more than twice a week from the same test, it gets quarantined immediately — no exceptions.`,
  },
];
