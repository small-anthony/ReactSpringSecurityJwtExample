package com.lacouf.rsbjwt.presentation;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@ActiveProfiles("test")
class UserControllerWebMvcTest {
    // TODO

//    @Autowired
//    private WebApplicationContext webApplicationContext;
//
//    private ObjectMapper objectMapper;
//
//    @MockitoBean
//    private UserAppService userService;
//
//    @MockitoBean
//    private GestionnaireRepository gestionnaireRepository;
//
//    @MockitoBean
//    private EtudiantRepository etudiantRepository;
//
//    @MockitoBean
//    private ProfesseurRepository professeurRepository;
//
//    @MockitoBean
//    private UserAppRepository userAppRepository;
//
//    @MockitoBean
//    private PasswordEncoder passwordEncoder;
//
//    private MockMvc mockMvc;
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
//                .build();
//        objectMapper = new ObjectMapper();
//    }
//
//    @Test
//    @DisplayName("POST /user/login returns 202 and token on success")
//    void authenticateUser_success_returnsAcceptedAndToken() throws Exception {
//        // Arrange
//        LoginDTO login = new LoginDTO("user@example.com", "password");
//        when(userService.authenticateUser(any(LoginDTO.class))).thenReturn("token123");
//
//        // Act + Assert
//        mockMvc.perform(post("/user/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(login)))
//                .andExpect(status().isAccepted())
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
//                .andExpect(jsonPath("$.tokenType").value("BEARER"))
//                .andExpect(jsonPath("$.accessToken").value("token123"));
//    }
//
//    @Test
//    @DisplayName("POST /user/login returns 401 on failure")
//    void authenticateUser_failure_returnsUnauthorized() throws Exception {
//        // Arrange
//        LoginDTO login = new LoginDTO("user@example.com", "wrong");
//        when(userService.authenticateUser(any(LoginDTO.class))).thenThrow(new RuntimeException("bad creds"));
//
//        // Act + Assert
//        mockMvc.perform(post("/user/login")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(login)))
//                .andExpect(status().isUnauthorized())
//                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
//                .andExpect(jsonPath("$.tokenType").value("BEARER"))
//                .andExpect(jsonPath("$.accessToken").value(org.hamcrest.Matchers.nullValue()));
//    }
}
