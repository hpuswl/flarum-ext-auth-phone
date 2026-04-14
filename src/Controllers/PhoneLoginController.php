<?php

namespace Hpuswl\AuthPhone\Controllers;

use Flarum\Forum\LogInValidator;
use Flarum\Http\AccessToken;
use Flarum\Http\RememberAccessToken;
use Flarum\Http\Rememberer;
use Flarum\Http\SessionAccessToken;
use Flarum\Http\SessionAuthenticator;
use Flarum\User\Event\LoggedIn;
use Flarum\User\User;
use Flarum\User\UserRepository;
use Hpuswl\AuthPhone\Common\Aes;
use Hpuswl\AuthPhone\KeyDisk;
use Hpuswl\AuthPhone\PhoneCode;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Arr;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Laminas\Diactoros\Response\JsonResponse;
use Symfony\Contracts\Translation\TranslatorInterface;

class PhoneLoginController implements RequestHandlerInterface
{
    /**
     * @var \Flarum\User\UserRepository
     */
    protected $users;

    /**
     * @var SessionAuthenticator
     */
    protected $authenticator;

    /**
     * @var Dispatcher
     */
    protected $events;

    /**
     * @var Rememberer
     */
    protected $rememberer;

    /**
     * @var LogInValidator
     */
    protected $validator;

    /**
     * @param UserRepository $users
     * @param SessionAuthenticator $authenticator
     * @param Dispatcher $events
     * @param Rememberer $rememberer
     * @param LogInValidator $validator
     */
    public function __construct(UserRepository $users, SessionAuthenticator $authenticator, Dispatcher $events, Rememberer $rememberer, LogInValidator $validator)
    {
        $this->users = $users;
        $this->authenticator = $authenticator;
        $this->events = $events;
        $this->rememberer = $rememberer;
        $this->validator = $validator;
    }

    /**
     * {@inheritdoc}
     */
    public function handle(Request $request): ResponseInterface
    {
        $body = $request->getParsedBody();
        $phone = Arr::get($body, 'phone');
        $region = Arr::get($body, 'region');
        $code = Arr::get($body, 'code');
        $remember = Arr::get($body, 'remember');
        $translator = resolve(TranslatorInterface::class);

        if (!$phone || !$region || !$code) {
            return new JsonResponse(['status' => false, 'msg' => $translator->trans('hpuswl-auth-phone.forum.alerts.param_invalid')]);
        }

        $regionInfo = ["ChineseMainland" => "86", "HongKong" => "852", "Macao" => "853", "Taiwan" => "886"];
        if (!isset($regionInfo[$region])) {
            return new JsonResponse(['status' => false, 'msg' => $translator->trans('hpuswl-auth-phone.forum.alerts.region_invalid')]);
        }

        $fullPhone = $regionInfo[$region] . $phone;

        $disk = resolve(KeyDisk::class);
        $keyInfo = $disk->get();
        $encryptPhone = (new Aes($keyInfo["key"], $keyInfo["iv"]))->Encrypt($fullPhone);

        $user = User::where('phone', $encryptPhone)->first();
        if (!$user) {
            return new JsonResponse(['status' => false, 'msg' => $translator->trans('hpuswl-auth-phone.forum.alerts.user_not_found')]);
        }

        $phoneCode = PhoneCode::where([
            ["phone", "=", $encryptPhone],
            ["exp_time", ">=", time()],
            ["code", "=", $code]
        ])->orderBy("created_time", "desc")->first();

        if (!$phoneCode) {
            return new JsonResponse(['status' => false, 'msg' => $translator->trans('hpuswl-auth-phone.forum.alerts.code_invalid')]);
        }

        PhoneCode::where([
            ["phone", "=", $encryptPhone],
            ["code", "=", $code],
            ["exp_time", ">=", time()]
        ])->delete();

        if ($remember) {
            $token = RememberAccessToken::generate($user->id);
        } else {
            $token = SessionAccessToken::generate($user->id);
        }

        $token->touch($request);

        $response = new JsonResponse([
            'token' => $token->token,
            'userId' => $user->id
        ]);

        $session = $request->getAttribute('session');
        if ($session) {
            $this->authenticator->logIn($session, $token);
            $this->events->dispatch(new LoggedIn($user, $token));
        }

        if ($token instanceof RememberAccessToken) {
            $response = $this->rememberer->remember($response, $token);
        }

        return $response;
    }
}