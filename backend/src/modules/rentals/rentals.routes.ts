import type { FastifyInstance } from "fastify";
import { requireOrganizationAdminOrAdmin } from "../../security/admin-auth";
import {
  bulkDeleteRentalsController,
  completeRegistrationController,
  confirmInitialPaymentController,
  confirmRetrievalController,
  createAuthenticationOptionsController,
  createRetrievalAuthenticationOptionsController,
  createRegistrationOptionsController,
  createRentalController,
  deleteRentalController,
  getRentalController,
  listOrgRentalsController,
  overrideReleaseController,
  retrieveByCredentialController,
  startStoringController,
  retrieveLockerController
} from "./rentals.controller";
import {
  authenticationOptionsSchema,
  bulkDeleteRentalsSchema,
  completeRegistrationSchema,
  confirmInitialPaymentSchema,
  confirmRetrievalSchema,
  createRentalSchema,
  deleteOrganizationRentalSchema,
  getRentalSchema,
  listOrganizationAuditSchema,
  overrideReleaseSchema,
  registrationOptionsSchema,
  retrievalLookupOptionsSchema,
  retrieveByCredentialSchema,
  retrieveLockerSchema,
  startStoringSchema,
  type BulkDeleteRentalsBody,
  type CompleteRegistrationBody,
  type ConfirmInitialPaymentBody,
  type CreateRentalBody,
  type DeleteOrganizationRentalParams,
  type OrganizationAuditParams,
  type OverrideReleaseBody,
  type RentalParams,
  type RetrieveLockerBody,
  type StartStoringBody
} from "./rentals.schemas";
                                              //tung tung sahur para dar sorte no TCC
                                              //                                               ...                                                               
                                              //                                         :::::::::::::::::                                                       
                                              //                                      ----:::::::::::::::----                                                    
                                              //                                    ==---::::::::::::::::-----=                                                  
                                              //                                   +==---::::::::::::::::----==+                                                 
                                              //                                   +==---:::::::::::::::::---==+                                                 
                                              //                                   =----:::::::.........:::---=+                                                 
                                              //                                   -:::::::::::-=+*****+=-:---=+                                                 
                                              //                                   +==-::::::=#%%%%%%%%###+---=+                                                 
                                              //                                  %%%%#*=---=%%%%%%%%%%##***=-=+                                                 
                                              //                                =%%%%%%%#+==*%%%%%%#***#%#*+===+                                                 
                                              //                                %%%%%%%%%%++*%%%%*++==+==*%*+==+                                                 
                                              //                               %#*++*#%@%%+=*%%%#*===:.:+*+%*==+                                                 
                                              //                               #*=-:-+*%@%=-+%%%*-#%%*#=.-###+++                                                 
                                              //                               *+#%=:.=#%%-.=#%%=+%@@@@#:.+%#*++                                                 
                                              //                               *%%@%%=.=%%:.-+#%=*@%%%%#--=+#*++                                                 
                                              //                               #%@%%@=.-##..-==+**%%%%%*+=++:--=                                                 
                                              //                               #%%%%#=-=#*..---=****#**+**=..::=                                                 
                                              //                               ####*++*#+=.:---:-#%%%%%#=....::-                                                 
                                              //                               %%####%*=+-.:----::-+++-:....::-=.                                                
                                              //                              .=+##*+--=*:.:-===--::::::::--==+*#                                                
                                              //                              ::..:::-=**:.:-==+*++======++**##%%                                                
                                              //                              +=-::-=+**=::::..:=%%########%%%%%%                                                
                                              //                              ##****#%%*##*#******#%%%%%%%%%%%%%%                                                
                                              //                              =#%%%%%%%%@@@@@@@@%-:=#%@%%%%%%%%%%                                                
                                              //                               =#%%@@#+#@@@@@@@#=...:+%%%%%%%%%%%                                                
                                              //                                =+%%%+-*%@@@@#=:...:+%%%%%%%%%%%%                                                
                                              //                                 :+%%#++#%%%%*+***#%%#**#%%%%%%%%                                                
                                              //                                   #%%@%%%%%%%%#*+=+*=-=*#%%%%%%#                                                
                                              //                                   =##%%%%%%#+--=*##+--=*##%%%%%#                                                
                                              //                                   -###%%%%%%%%%%%#=--=+*###%%%%#                                                
                                              //                                    +##%%%%%%%%%#*=---=+*########                                                
                                              //                                    -###%%%%%#*=-::-=+**#########                                                
                                              //                                    :#%#####*+=---=+**###***#####                                                
                                              //                                    .*%%%###*++++**####******####                                                
                                              //                                    :*%%%%%%#####%%%##**+*****###                                                
                                              //                                    :+%%%%%%%%%%%%%#*+++++****###                                                
                                              //                                    --%%%%%%%%%%##**++++++***+==#                                                
                                              //                                    --%%%%%%%%##**++++++++***=::=                                                
                                              //                                     :%%%%%###**+++++++++***#+=-=                                                
                                              //                                    +:#%%%###**+++++++++****##+==                                                
                                              //                                    #-*%%%#***++++++++*****#%%+==                                                
                                              //                                    #=+%%##***++++++++*****##%*==                                                
                                              //                                    #+=%%##**++++++++******##%#+=                                                
                                              //                                   :#*=%%##*******+********##%%*==                                               
                                              //                                   #%*-%%##****************##%%#+=                                               
                                              //                                   #%#-%%###***************##%%%*=                                               
                                              //                                   #%%-#%%##***************##%%%+=                                               
                                              //                                   *%%=#%#####*************###%*::                                               
                                              //                                   #%%+#%######*************##%+:-                                               
                                              //                                   #%%*#######**************##%-:                                                
                                              //                                   *%%#######***************###:-                                                
                                              //                                   *#%#######***************##*:=                                                
                                              //                                  *+#%##%#####**************##+:                                                 
                                              //                                  +*% ##%#####*************##%=-                                                 
                                              //                                  #%   %#####*************###*-=                                                 
                                              //                                  ##   %%#####*#*********###+::=                                                 
                                              //                                  =#   %%#####***********#*=::-+                                                 
                                              //                                  -#   #########**********=+*=+*                                                 
                                              //                                  ++  %#########*********+#%#+*#                                                 
                                              //                                  %**%%#######*#*********#%%+*#                                                  
                                              //                                   #*#%#########*******####*+#%                                                  
                                              //                                   ++#%%########*******###**#%                                                   
                                              //                                   =*%%%########******#####%#                                                    
                                              //                                   +#  *%%%%%%%%###%%%%%%%%%                                                     
                                              //                                  =*    %%%%%%      =%%%%%%                                                      
                                              //                                 -+#    %%%%%%       %#**#%                                                      
                                              //                                ==*     #%%%%%       #****%                                                      
                                              //                               -=*      ##%%%%       *+++*#                                                      
                                              //                              --+        *#%%%       *+++*#                                                      
                                              //                             --+#        **%%%       +++**                                                       
                                              //                            .-=*         **#%%       +++**                                                       
                                              //                           --=*          ++*%%       ++++*                                                       
                                              //                           --+          ===*#%       --=+*                                                       
                                              //                          --+#          #***#%       +++**                                                       
                                              //                         --=#            %%%#%        ####                                                       
                                              //                        --=*             %%%#%        %%###                                                      
                                              //                       --=*              %%%#%        %%###                                                      
                                              //                     :--=*+              %%###        %##**                                                      
                                              //                     --=*#               %%###         ##**#                                                     
                                              //                    --+*#                .####         ##*##                                                     
                                              //                  ==-=*#                  ####         #####                                                     
                                              //                 ==-=*#%                  ####         #####                                                     
                                              //                ====**%                   ####         #####                                                     
                                              //               ====+*#                    ####         #####                                                     
                                              //              +===+*#                      ###=        ####-                                                     
                                              //             ++==+*#%                      ####         ###                                                      
                                              //            ++==+*#%                       ####         ###                                                      
                                              //           +++++*##                        ####         ###                                                      
                                              //          +++++*###                        ###%         ###                                                      
                                              //         *++++**#%                         **#%         ###                                                      
                                              //        *++++**#%                          **##%        **#                                                      
                                              //       **++***##                          =+*##%       ++**                                                      
                                              //      *******##+                        .-=+*##%%      ==+*#                                                     
                                              //     *******##%                       ..:-=+*###%+    --=+*#                                                     
                                              //    *******##%                      .::-==+**####%%   ---=+*                                                     
                                              //   *******##%                   :..::--==++*#####%%  ----==+*                                                    
                                              //  ##****###%              =-:::::.:--==++*######%%%-:-----==+                                                    
                                              // :########%*            -----==-::--===+##%%%%%%%*-:--------=                                                    
                                              //  %%####%%#            =======---===++*#%         :----------=                                                   
                                              //     %%%%%             +=+=----==**####           ==-==--=--==-                                                  
                                              //                          *+==++*%               =+*-=*+-**-**-+                                                 
                                              //                                               --=**=+%+=#*=**=#                                                 
                                              //                                              +++*#+=+%+=#%##+:                
export async function rentalsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateRentalBody }>("/rentals", { schema: createRentalSchema }, createRentalController);

  app.get<{ Params: RentalParams }>("/rentals/:id", { schema: getRentalSchema }, getRentalController);

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/webauthn/registration-options",
    { schema: registrationOptionsSchema },
    createRegistrationOptionsController
  );

  app.post<{ Params: RentalParams; Body: CompleteRegistrationBody }>(
    "/rentals/:id/webauthn/registrations",
    { schema: completeRegistrationSchema },
    completeRegistrationController
  );

  app.post<{ Params: RentalParams; Body: StartStoringBody }>(
    "/rentals/:id/start-storing",
    { schema: startStoringSchema },
    startStoringController
  );

  app.post<{ Params: RentalParams; Body: ConfirmInitialPaymentBody }>(
    "/rentals/:id/confirm-initial-payment",
    { schema: confirmInitialPaymentSchema },
    confirmInitialPaymentController
  );

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/webauthn/authentication-options",
    { schema: authenticationOptionsSchema },
    createAuthenticationOptionsController
  );

  app.post(
    "/retrievals/webauthn/authentication-options",
    { schema: retrievalLookupOptionsSchema },
    createRetrievalAuthenticationOptionsController
  );

  app.post<{ Body: RetrieveLockerBody }>(
    "/retrievals/webauthn/retrieve",
    { schema: retrieveByCredentialSchema },
    retrieveByCredentialController
  );

  app.post<{ Params: RentalParams; Body: RetrieveLockerBody }>(
    "/rentals/:id/retrieve",
    { schema: retrieveLockerSchema },
    retrieveLockerController
  );

  app.post<{ Params: RentalParams }>(
    "/rentals/:id/confirm-retrieval",
    { schema: confirmRetrievalSchema },
    confirmRetrievalController
  );

  app.get<{ Params: OrganizationAuditParams; Querystring: { location_id?: string; limit?: string; offset?: string } }>(
    "/org/:organizationId/audit",
    { schema: listOrganizationAuditSchema, preHandler: requireOrganizationAdminOrAdmin },
    listOrgRentalsController
  );

  app.delete<{ Params: DeleteOrganizationRentalParams }>(
    "/org/:organizationId/rentals/:id",
    { schema: deleteOrganizationRentalSchema, preHandler: requireOrganizationAdminOrAdmin },
    deleteRentalController
  );

  app.post<{ Params: OrganizationAuditParams; Body: BulkDeleteRentalsBody }>(
    "/org/:organizationId/rentals/bulk-delete",
    { schema: bulkDeleteRentalsSchema, preHandler: requireOrganizationAdminOrAdmin },
    bulkDeleteRentalsController
  );

  app.post<{ Params: DeleteOrganizationRentalParams; Body: OverrideReleaseBody }>(
    "/organizations/:organizationId/rentals/:id/override-release",
    { schema: overrideReleaseSchema, preHandler: requireOrganizationAdminOrAdmin },
    overrideReleaseController
  );
}
