#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import <Firebase.h>

#import <Appier/Appier.h>
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate ()<UNUserNotificationCenterDelegate>

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  [FIRApp configure];
  
  // delegate to responding to notification actions
  [UNUserNotificationCenter currentNotificationCenter].delegate = self;

  self.moduleName = @"RN723";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // request push notification
  if (@available(iOS 10.0, *)) {
    UNAuthorizationOptions options = (UNAuthorizationOptions) (UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound | UNAuthorizationOptionCarPlay);
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    [center requestAuthorizationWithOptions:options completionHandler:^(BOOL granted, NSError *error){
      NSLog(@"GRANTED: %i, Error: %@", granted, error);
    }];
  }
  else{
    // Fallback on earlier versions - iOS 8 & 9
    UIUserNotificationType types = UIUserNotificationTypeAlert | UIUserNotificationTypeSound |
    UIUserNotificationTypeBadge;
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:types categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
  }


  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}


// handling the click and deeplink events from push notification
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)(void))completionHandler API_AVAILABLE(ios(10.0)){
  [[QGSdk getSharedInstance] userNotificationCenter:center didReceiveNotificationResponse:response];
  completionHandler();
}

// used for silent push handling
// pass completion handler UIBackgroundFetchResult accordingly
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull void(^)(UIBackgroundFetchResult))completionHandler
{
  [[QGSdk getSharedInstance] application:application didReceiveRemoteNotification:userInfo];
  completionHandler(UIBackgroundFetchResultNoData);
}

// handle foreground push
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void(^)(UNNotificationPresentationOptions options))completionHandler API_AVAILABLE(ios(10.0)){
  [[QGSdk getSharedInstance] userNotificationCenter:center willPresentNotification:notification];
  UNNotificationPresentationOptions option = UNNotificationPresentationOptionBadge | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert;
  completionHandler(option);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
